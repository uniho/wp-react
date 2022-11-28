<?php

// クッキーの持続期間(秒)
define('COOKIE_EXPIRES', 60 * 60 * 24 * 3);

// パスワードリセットなどのチャレンジタイム(秒)
define('RESETPASS_CHALLENGE_TIME', 60 * 10);


// 初期化処理
add_action('after_setup_theme', function() {
  //
});


// style.css の読み込み
add_action('wp_enqueue_scripts', function() {
  wp_enqueue_style('unsta-style', get_stylesheet_uri());
});


// WP REST API エンドポイント追加(get)
add_action('rest_api_init', function() {
  register_rest_route('unsta/v1', '/api/(?P<cmd>[\\w\\d\\-]+)\\/(?P<arg>.*)', [
    'methods' => 'GET',
    'callback' => function($request) {
      $apcu = \Unsta::apcuGetValue();
      if (!$apcu) {
        if (!\Unsta::flood()->isAllowed('new cookie', 1, 10)) {
          return new WP_HTTP_Response('crowded', 400);
        }
        \Unsta::flood()->register('new cookie', 10);

        $u = parse_url(home_url()); 
        $key = wp_generate_uuid4();
        setcookie('unsta-cookie', $key, [
          'expires' => time()+COOKIE_EXPIRES,
          'path' => $u['path'],
          'domain' => $u['host'],
        ]);
        
        $apcu = [];
        $apcu['userid'] = 0;
        apcu_store(\Unsta::apcuKey($key), $apcu, COOKIE_EXPIRES);
      }

      $cmd = $request['cmd'];
      if ($cmd == 'unsta-token') {
        if (isset($apcu['token'])) {
          $token = $apcu['token'];
        } else {
          $token = wp_generate_uuid4();
          $apcu['token'] = $token;
          \Unsta::apcuSetValue($apcu, COOKIE_EXPIRES);
        }
        return $token;
      }

      $cmd = get_stylesheet_directory()."/unsta/php/api/cmds/{$cmd}.php";
      if (!file_exists($cmd)) {
        return new WP_HTTP_Response('bad cmd', 400);
      }

      require_once($cmd);
      try {
        return get($request);
      } catch (\Exception $e) {
        return ['error' => ['message' => $e->getMessage()]];
      }
    }
  ]); }
);


// WP REST API エンドポイント追加(post)
add_action('rest_api_init', function() {
  register_rest_route('unsta/v1', '/api/(?P<cmd>[\\w\\d\\-]+)\\/(?P<arg>.*)', [
    'methods' => 'POST',
    'callback' => function($request) {
      $apcu = \Unsta::apcuGetValue();
      if (!$apcu) {
        return new WP_HTTP_Response('bad request', 400);
      }

      $cmd = $request['cmd'];

      if ($cmd != 'login') {
        $token = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : false;
        if (!isset($apcu['token']) || !$token || $token !== $apcu['token']) {
          return new WP_HTTP_Response('bad token', 403);
        }
      }
      
      $cmd = get_stylesheet_directory()."/unsta/php/api/cmds/{$cmd}.php";
      if (!file_exists($cmd)) {
        return new WP_HTTP_Response('bad cmd', 400);
      }

      require_once($cmd);
      try {
        return post($request, file_get_contents('php://input'));
      } catch (\Exception $e) {
        return ['error' => ['message' => $e->getMessage()]];
      }
    }
  ]); }
);


// 一覧のカラムを変更
add_filter('manage_posts_columns', function($columns) {
  // カラムのタイトル
  $columns['postid'] = 'ID';
  unset($columns['date']); // 順序を変更するため
  $columns['date'] = 'Date';
  return $columns;
});
add_action('manage_posts_custom_column', function($column_name, $post_id) {
  // カラムの内容
  switch ($column_name) {
    case 'date':
      echo get_the_date($post_id = $post_id); 
      break;
    case 'postid':
      echo $post_id;
      break;
    case 'thumbnail': 
      // $thumb = get_the_post_thumbnail($post_id, array(100,100), 'thumbnail');
      // echo ( $thumb ) ? $thumb : '－';
      break;
    case 'count': 
      // $count = mb_strlen(strip_tags(get_post_field('post_content', $post_id)));
      // echo $count;
      break;
  }
}, 10, 2);

add_filter('manage_pages_columns', function($columns) {
  // カラムのタイトル
  $columns['postid'] = 'ID';
  unset($columns['date']); // 順序を変更するため
  $columns['date'] = 'Date';
  return $columns;
});
add_action('manage_pages_custom_column', function($column_name, $post_id) {
  // カラムの内容
  switch ($column_name) {
    case 'date':
      echo get_the_date($post_id = $post_id); 
      break;
    case 'postid':
      echo $post_id;
      break;
    case 'thumbnail': 
      // $thumb = get_the_post_thumbnail($post_id, array(100,100), 'thumbnail');
      // echo ( $thumb ) ? $thumb : '－';
      break;
    case 'count': 
      // $count = mb_strlen(strip_tags(get_post_field('post_content', $post_id)));
      // echo $count;
      break;
  }
}, 10, 2);


// SQL を実行する SC
add_shortcode('sql', function($atts) {
  if (!isset($atts['sql'])) return 'no sql';
  
  global $wpdb;

  $sql = $atts['sql'];
  if ($sql == 'show tables') $sql = "SHOW TABLES FROM " . DB_NAME;

  $r = $wpdb->get_results($sql);
  return json_encode($r);
});


// React 等で表示する SC
add_shortcode('jsApp', function ($atts) {
  // $atts = shortcode_atts([
  //   'src' => '',
  //   'root' => '#app',
  //   'func' => 'main',
  // ], $atts);
  if (!isset($atts['func'])) $atts['func'] = 'main';
  if (!isset($atts['root'])) $atts['root'] = '#app';

  $jsfile = get_stylesheet_directory() . '/unsta/js/srcs/' . $atts['src'];
  if (!$atts['src'] || !file_exists($jsfile)) {
    return 'bad src';
  }
  $jsfile = get_stylesheet_directory_uri() . '/unsta/js/srcs/' . $atts['src'];
  
  $func = $atts['func'];

  $uri = home_url();
  $props = $atts;
  $props['uri'] = $uri;
  $props = json_encode($props);

  $src =
    "<script type=\"module\">\n".
    "(async function() { ".
      "const src = await import('$jsfile'); ".
      "await src.$func($props); ".
    "})();\n</script>";

  return $src;
});


// カレントユーザーの情報を取得する SC 
add_shortcode('curuser', function() {
  $atts = shortcode_atts([
    'src' => '',
    'root' => '#app',
    'func' => 'main',
  ], $atts);
  $user = \Unsta::currentUser();
  $uid = $user['uid'];
  return json_encode($obj);
});


// 
add_shortcode('scTest', function() {
  $obj = get_queried_object();  //現在表示しているページのオブジェクトを取得
  return json_encode($obj);
});


//
class FloodControl {

  const prefix = 'unsta-flood';

  public function __construct() {
  }

  public function register($name, $window = 3600, $identifier = NULL) {
    if (!isset($identifier)) {
      $identifier = $_SERVER["REMOTE_ADDR"];
    }
    // We can't use REQUEST_TIME here, because that would not guarantee
    // uniqueness.
    $time = microtime(TRUE);
    $events = apcu_fetch(self::prefix."-{$name}-{$identifier}");
    if (!$events) $events = [];
    $events[] = ['expire' => $time + $window, 'time' => $time];
    apcu_store(self::prefix."-{$name}-{$identifier}", $events, $window);
  }

  public function clear($name, $identifier = NULL) {
    if (!isset($identifier)) {
      $identifier = $_SERVER["REMOTE_ADDR"];
    }
    apcu_delete(self::prefix."-{$name}-{$identifier}");
  }

  public function isAllowed($name, $threshold, $window = 3600, $identifier = NULL) {
    if (!isset($identifier)) {
      $identifier = $_SERVER["REMOTE_ADDR"];
    }
    $events = apcu_fetch(self::prefix."-{$name}-{$identifier}");
    if (!$events) {
      return $threshold > 0;
    }
    $limit = microtime(TRUE) - $window;
    $number = count(array_filter($events, function ($entry) use ($limit) {
      return $entry['time'] > $limit;
    }));
    return ($number < $threshold);
  }
}


//
class Lock {

  const prefix = 'unsta-lock-';
  protected $locks = [];

  public function acquire($name, $timeout = 30) {
    $timeout = max($timeout, 1);
    if (isset($this->locks[$name])) {
      $exists = apcu_exists(self::prefix.$name);
      if (!$exists) {
        apcu_store(self::prefix.$name, true, $timeout);
        return true;
      }
      unset($this->locks[$name]);
      return false;
    }
    $exists = apcu_exists(self::prefix.$name);
    if (!$exists) {
      apcu_store(self::prefix.$name, true, $timeout);
      $this->locks[$name] = true;
      return true;
    }
    return false;
  }

  public function lockMayBeAvailable($name) {
    return !apcu_exists(self::prefix.$name);
  }

  public function release($name) {
    unset($this->locks[$name]);
    apcu_delete(self::prefix.$name);
  }

  public function releaseAll() {
    foreach ($this->locks as $key => $val) {
      apcu_delete(self::prefix.$key);
    }
    $this->locks = [];
  }

  public function wait($name, $delay = 30) {
    $delay = (int) $delay * 1000000;
    $sleep = 25000;
    while ($delay > 0) {
      usleep($sleep);
      $delay = $delay - $sleep;
      $sleep = min(500000, $sleep + 25000, $delay);
      if ($this->lockMayBeAvailable($name)) return false;
    }
    return true;
  }
}


//
class Transaction {

  protected $rolledBack = false;
  protected $name;
  protected $transactionLayers = [];

  public function __construct($name = null) {
    $this->connection = $connection;
    if (!$depth = count($this->transactionLayers)) {
      $this->name = 'unsta_transaction';
    } else if (!$name) {
      $this->name = 'savepoint_' . $depth;
    } else {
      $this->name = $name;
    }
    if (isset($this->transactionLayers[$name])) throw new \Exception("$name is already in use.");
    global $wpdb;
    if (count($this->transactionLayers) > 0) {
      $wpdb->query('SAVEPOINT ' . $name);
    } else {
      $wpdb->query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
      $wpdb->query('START TRANSACTION');
    }
    $this->transactionLayers[$name] = $name;
  }

  public function __destruct() {
    if (!$this->rolledBack) {
      if (!isset($this->transactionLayers[$name])) return;
      $this->transactionLayers[$name] = FALSE;
      $this->popCommittableTransactions();
    }
  }

  public function name() {
    return $this->name;
  }

  public function rollBack() {
    $this->rolledBack = TRUE;
    $this->connection->rollBack($this->name);

    if (!isset($this->transactionLayers[$this->name])) return;
    $rolled_back_other_active_savepoints = FALSE;
    global $wpdb;
    while ($savepoint = array_pop($this->transactionLayers)) {
      if ($savepoint == $this->name) {
        if (empty($this->transactionLayers)) break;
        $wpdb->query('ROLLBACK TO SAVEPOINT ' . $savepoint);
        $this->popCommittableTransactions();
        if ($rolled_back_other_active_savepoints) throw new \Exception("TransactionOutOfOrder");
        return;
      } else {
        $rolled_back_other_active_savepoints = TRUE;
      }
    }

    $wpdb->query('ROLLBACK');
    if ($rolled_back_other_active_savepoints) throw new \Exception("TransactionOutOfOrder");
  }

  protected function popCommittableTransactions() {
    foreach (array_reverse($this->transactionLayers) as $name => $active) {
      if ($active) break;
      unset($this->transactionLayers[$name]);
      global $wpdb;
      if (empty($this->transactionLayers)) {
        $wpdb->query('COMMIT');
      } else {
        $wpdb->query('RELEASE SAVEPOINT ' . $name);
      }
    }
  }
}


//
class Unsta {

  public static $floodControl = false;
  private static $db = false;
  private static $lock = false;

  // ブラックリストに登録されているかどうかチェック
  // 戻り値: 
  public static function inBlackList($addr) {
    return 'test1';
  }

  // ブラックリストに登録する
  // $expired: 制限する秒数
  public static function addBlackList($addr, $expired) {
    return 'test1';
  }

  public static function isAdmin() {
    return current_user_can('administrator');
  }

  public static function database() {
    if (!self::$db) {
      global $wpdb;
      self::$db = $wpdb;
      self::$db->startTransaction = function() {
        return new Transaction();
      };
    }
    return self::$db;
  }

  public static function lock() {
    if (!self::$lock) self::$lock = new Lock();
    return self::$lock;
  }

  public static function flood() {
    if (!self::$floodControl) !self::$floodControl = new FloodControl();
    return self::$floodControl;
  }

  public static function currentUser() {
    $apcu = self::apcuGetValue();
    return [
      'uid' => isset($apcu['userid']) ? (int)$apcu['userid'] : 0,
    ];
  }

  public static function apcuGetValue() {
    return isset($_COOKIE['unsta-cookie']) ? apcu_fetch(self::apcuKey($_COOKIE['unsta-cookie'])) : false;
  }

  public static function apcuSetValue($value, $expires) {
    if (!isset($_COOKIE['unsta-cookie'])) return;
    apcu_store(self::apcuKey($_COOKIE['unsta-cookie']), $value, $expires);
  }

  public static function apcuKey($cookie) {
    return $cookie . $_SERVER["REMOTE_ADDR"];
  }

  public static function getConfigValue($key) {
    global $wpdb;
    $tpf = $wpdb->prefix;
    $sql = "SELECT b.meta_value as value FROM {$tpf}posts a
      LEFT JOIN {$tpf}postmeta b ON a.ID = b.post_id
      WHERE a.post_type = 'config' AND post_title = %s 
    ";
    $row = $wpdb->get_row($wpdb->prepare($sql, $key));
    return $row->value; 
  }
}
