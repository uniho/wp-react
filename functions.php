<?php

// dbDelta() を使えるようにする
// dbDelta() 使用上の注意
// * 1 行につき、ひとつのフィールドを定義してください。〔訳注：ひとつの行に複数のフィールド定義を書くことはできません。さもなくば ALTER TABLE が正しく実行されず、プラグインのバージョンアップに失敗します。〕
// * PRIMARY KEY というキーワードと、主キーの定義の間には、二つのスペースが必要です。
// * INDEX という同義語ではなく、KEY というキーワードを使う必要があります。さらに最低ひとつの KEY を含めなければなりません。
// * フィールド名のまわりにアポストロフィ（'）やバッククォート（`）を使ってはいけません。
// * フィールドタイプはすべて小文字であること。
// * SQL キーワード、例えば CREATE TABLE や UPDATE は、大文字であること。
// * 長さパラメータを受け付けるすべてのフィールドに長さを指定すること。例えば int(11) のように。
// wp-admin/includes/schema.php を参照せよ
require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

// クッキーの持続期間
define('COOKIE_EXPIRES', 60 * 60 * 24 * 7);

// 初期化処理
// see: https://qiita.com/kijtra/items/68a06083d25af8b5a119
add_action('after_setup_theme', function() {
  //
});


// style.css の読み込み
add_action('wp_enqueue_scripts', function() {
  wp_enqueue_style('unsta-style', get_stylesheet_uri());
});

// WP REST API エンドポイント追加
// index.php?rest_route=/unsta/v1/post-api でアクセスできる。
add_action('rest_api_init', function() {
  register_rest_route('unsta/v1', '/post-api/(?P<cmd>[\\w\\d\\-]+)\\/(?P<arg>.*)', [
    'methods' => 'POST',
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

      $cmd = get_stylesheet_directory()."/unsta/php/post-api/cmds/{$cmd}.php";
      if (!file_exists($cmd)) {
        return new WP_HTTP_Response('bad cmd', 400);
      }

      require_once($cmd);
      return post($request, file_get_contents('php://input'));
    }
  ]); }
);


// DB Table の準備をする SC
add_shortcode('dbInit', function($atts) {
  global $wpdb;

  $varchar_max = 65535;

  //
  $tableName = "{$wpdb->prefix}unsta_config"; //テーブル名

  $r = $wpdb->get_results("SHOW TABLES FROM '" . DB_NAME . "' LIKE '$tableName'");
  if (!$r) {
    $sql = "CREATE TABLE {$tableName} (
      cfg_key varchar(20),
      cfg_val longtext,
      PRIMARY KEY  (cfg_key)
    ) {$wpdb->get_charset_collate()};";
    dbDelta($sql);
  
    $pwSeed = md5(uniqid(rand(), true));
    $sql = "INSERT INTO {$tableName} (cfg_key, cfg_val) VALUES(
      'pwSeed', '{$pwSeed}'
    );";
    $wpdb->query($sql);
  }

  //
  $tableName = "{$wpdb->prefix}unsta_blacklist"; //テーブル名

  $r = $wpdb->get_results("SHOW TABLES FROM '" . DB_NAME . "' LIKE '$tableName'");
  if (!$r) {
    $sql = "CREATE TABLE {$tableName} (
      bl_host varchar($varchar_max),
      bl_start timestamp,
      bl_expired bigint(20) unsigned,
      bl_version bigint(20) unsigned,
      bl_json longtext,
      PRIMARY KEY  (bl_host),
      KEY index_start (bl_start)
    ) {$wpdb->get_charset_collate()};";
    dbDelta($sql);
  }

  //
  $tableName = "{$wpdb->prefix}unsta_kokyaku"; //テーブル名

  $r = $wpdb->get_results("SHOW TABLES FROM '" . DB_NAME . "' LIKE '$tableName'");
  if (!$r) {
    $sql = "CREATE TABLE {$tableName} (
      k_id int(11) unsigned NOT NULL auto_increment,
      k_no int(11) unsigned NOT NULL,
      k_furi varchar($varchar_max),
      k_tel varchar($varchar_max),
      k_name varchar($varchar_max),
      k_version bigint(20) unsigned,
      k_json longtext,
      PRIMARY KEY  (k_id),
      UNIQUE KEY index_no (k_no),
      KEY index_furi (k_furi),
      KEY index_tel (k_tel)
    ) {$wpdb->get_charset_collate()};";
    dbDelta($sql);
  }
});


// SQL を実行する SC
add_shortcode('sql', function($atts) {
  if (!isset($atts['sql'])) return 'no sql';
  
  global $wpdb;

  $sql = $atts['sql'];
  if ($sql == 'show tables') $sql = "SHOW TABLES FROM " . DB_NAME;

  $r = $wpdb->get_results($sql);
  return json_encode($r);
});


// ACF から値を取得する SC
add_shortcode('acf', function($atts) {
  if (isset($atts['field'])) {
    return get_field($atts['field']);
  }

  // 全フィールドの取得
  return json_encode(get_fields());
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


// 現在表示しているページのオブジェクトを json 形式で返す SC 
add_shortcode('page2js', function() {
  $obj = get_queried_object();  //現在表示しているページのオブジェクトを取得
  return json_encode($obj);
});


// POST された Data を JSON 形式で返す SC
add_shortcode('postData2js', function() {
  $raw = file_get_contents('php://input'); // POSTされた生のデータを受け取る
  $data = json_decode($raw); // json形式をphp連想配列に変換
  return json_encode($data); // php連想配列をjson形式に変換
});


// カスタムHTML から JavaScript に値を渡す SC
// [val2js]<script>'値'<script>[/val2js] のように<script>タグで挟むこと。
// <script> タグがないと勝手にエスケープされるので。
//
// * 名前と値はダブルクォートで囲む必要があります。シングルクォートは使えません
//   $bad_json = "{ 'bar': 'baz' }";
//   json_decode($bad_json); // null
// * 名前をダブルクォートで囲まなければなりません
//    $bad_json = '{ bar: "baz" }';
//    json_decode($bad_json); // null
// * 最後にカンマをつけてはいけません
//    $bad_json = '{ "bar": "baz", }';
//    json_decode($bad_json); // null
add_shortcode('val2js', function($atts, $content) {
  $content = trim(do_shortcode($content));
  $content = preg_replace('/<\/?script>/', '', $content);

  $data = json_decode($content); // json形式をphp連想配列に変換
  $json = json_encode($data); // php連想配列をjson形式に変換
  return '<script>window._____val2js_____ = '. $json .';</script>';
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
        "const r=await fetch('$uri/?rest_route=/unsta/v1/post-api/unsta-token/-', {".
          "method: 'POST', mode: 'cors', credentials: 'include',".
          "headers:{'Content-Type': 'application/json'},". 
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
}

