<?php

// クッキーの持続期間
define('COOKIE_EXPIRES', 60 * 60 * 24 * 7);


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
      $apcu = isset($_COOKIE['unsta-cookie']) ? apcu_fetch($_COOKIE['unsta-cookie']) : false;

      $cmd = $request['cmd'];
      if ($cmd == 'unsta-token') {
        $token = isset($apcu['token']) ? $apcu['token'] : false;
        if (!$token) {
          sleep(10);
          return new WP_HTTP_Response('no token', 400);
        }
        return ['unstaToken' => $token];
      }

      $token = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : false;
      if (!isset($apcu['token']) || !$token || $token !== $apcu['token']) {
        sleep(10);
        return new WP_HTTP_Response('bad token', 400);
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
      $apcu = isset($_COOKIE['unsta-cookie']) ? apcu_fetch($_COOKIE['unsta-cookie']) : false;

      $cmd = $request['cmd'];

      $token = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : false;
      if (!isset($apcu['token']) || !$token || $token !== $apcu['token']) {
        sleep(10);
        return new WP_HTTP_Response('bad token', 400);
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


// SQL を実行する SC
add_shortcode('sql', function($atts) {
  if (!isset($atts['sql'])) return 'no sql';
  
  global $wpdb;

  $sql = $atts['sql'];
  if ($sql == 'show tables') $sql = "SHOW TABLES FROM " . DB_NAME;

  $r = $wpdb->get_results($sql);
  return json_encode($r);
});


// 
add_shortcode('scTest', function() {
  // $token = (session_status() == 2 && isset($_SESSION['react-token'])) ? $_SESSION['react-token'] : false;
  // if (!$token) {
  //   session_start();
  //   $token = md5(uniqid(rand(), TRUE));
  //   $_SESSION['react-token'] = $token;
  // }
  $obj = get_queried_object();  //現在表示しているページのオブジェクトを取得
  return json_encode($obj);
});


// React 等で表示する SC
add_shortcode('jsApp', function ($atts) {
  $atts = shortcode_atts([
    'src' => '',
    'func' => 'main',
  ], $atts);

  $jsfile = get_stylesheet_directory() . '/unsta/js/srcs/' . $atts['src'];
  if (!$atts['src'] || !file_exists($jsfile)) {
    return 'bad src';
  }
  $jsfile = get_stylesheet_directory_uri() . '/unsta/js/srcs/' . $atts['src'];
  
  $func = $atts['func'];

  $uri = home_url();
  $rootid = md5(uniqid(rand(), true));
  $props = "{ uri:'$uri', rootid:'$rootid', }";

  $apcu = isset($_COOKIE['unsta-cookie']) ? apcu_fetch($_COOKIE['unsta-cookie']) : false;
  $token = isset($apcu['token']) ? $apcu['token'] : false;
  if (!$token) {
    $key = md5(uniqid(rand(), true));
    setcookie('unsta-cookie', $key, time()+COOKIE_EXPIRES);
    $token = md5(uniqid(rand(), true));
    apcu_store($key, ['token' => $token], COOKIE_EXPIRES);
  }

  $src =
    '<div id="'.$rootid.'"></div>'."\n".
    '<script type="module">'."\n".
    '(async function _() { '.
      "if (!window.unstaToken) {".
        "const r=await fetch('$uri/?rest_route=/unsta/v1/api/unsta-token/-', {".
          "mode: 'cors', credentials: 'include',".
        "}); ".
        "const json=await r.json(); ".
        "window.unstaToken=json.unstaToken; ".
      "} ".
      "const src = await import('$jsfile'); ".
      "await src.$func($props); ".
    "})();\n</script>";

  return $src;
});


//
class Unsta {
  // public static $stNum = 0;
  // public $num = 0;

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

  public static function currentUser() {
    $key = $_COOKIE['unsta-cookie'];
    $apcu = isset($key) ? apcu_fetch($key) : false;
    return [
      'uid' => isset($apcu['userid']) ? (int)$apcu['userid'] : 0,
      'count' => isset($apcu['count']) ? (int)$apcu['count'] : 0,
    ];
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
