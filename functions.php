<?php

// dbDelta() を使えるようにする
// dbDelta() 使用上の注意
// * 1 行につき、ひとつのフィールドを定義してください。〔訳注：ひとつの行に複数のフィールド定義を書くことはできません。さもなくば ALTER TABLE が正しく実行されず、プラグインのバージョンアップに失敗します。〕
// * PRIMARY KEY というキーワードと、主キーの定義の間には、二つのスペースが必要です。
// * INDEX という同義語ではなく、KEY というキーワードを使う必要があります。さらに最低ひとつの KEY を含めなければなりません。
// * フィールド名のまわりにアポストロフィ（'）やバッククォート（`）を使ってはいけません。
// * フィールドタイプはすべて小文字であること。
// * SQL キーワード、例えば CREATE TABLE や UPDATE は、大文字であること。
// * 長さパラメータを受け付けるすべてのフィールドに長さを指定すること。例えば int(11) のように。      dbDelta($sql);
require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

// クッキーの持続期間
define('COOKIE_EXPIRES', 60 * 60 * 24 * 7);

// 初期化処理
// see: https://qiita.com/kijtra/items/68a06083d25af8b5a119
function unsta_after_setup_theme() {
  //
}
add_action('after_setup_theme', 'unsta_after_setup_theme');


// style.css の読み込み
function unsta_enqueue_styles() {
  wp_enqueue_style('unsta-style', get_stylesheet_uri());
}
add_action('wp_enqueue_scripts', 'unsta_enqueue_styles');


// WP REST API エンドポイント追加
// index.php?rest_route=/unsta/v1/post-api でアクセスできる。
function unsta_rest_init() {
  register_rest_route('unsta/v1', '/post-api/(?P<cmd>[\w\d\-]+)\/(?P<arg>.*)', [
    'methods' => 'POST',
    'callback' => 'unsta_post_api',
  ]);
}
function unsta_post_api($request) {
  $apcu = isset($_COOKIE['unsta-cookie']) ? apcu_fetch($_COOKIE['unsta-cookie']) : false;

  $cmd = $request['cmd'];
  if ($cmd == 'unsta-token') {
    $token = isset($apcu['token']) ? $apcu['token'] : false;
    if (!$token) {
      return new WP_HTTP_Response('no token', 400);
    }
    return ['unstaToken' => $token];
  }

  $token = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : false;
  if (!isset($apcu['token']) || !$token || $token !== $apcu['token']) {
    return new WP_HTTP_Response('bad token', 400);
  }

  $cmd = get_stylesheet_directory()."/unsta/php/post-api/cmds/{$cmd}.php";
  if (!file_exists($cmd)) {
    return new WP_HTTP_Response('bad cmd', 400);
  }

  require_once($cmd);
  return post($request, file_get_contents('php://input'));
}
add_action('rest_api_init', 'unsta_rest_init');


// DB Table の準備をする SC
function sc_dbInit_func($atts) {
  global $wpdb;

  $tableName = "{$wpdb->prefix}unsta_config"; //テーブル名

  $varchar_max = 65535;

  $r = $wpdb->get_results("SHOW TABLES FROM '" . DB_NAME . "' LIKE '$tableName'");
  if (!$r) {
    $sql = "CREATE TABLE {$tableName} (
      cfg_key varchar(20)  PRIMARY KEY,
      cfg_val varchar($varchar_max)
    ) {$wpdb->get_charset_collate()};";
    dbDelta($sql);
  
    $pwSeed = md5(uniqid(rand(), true));
    $sql = "INSERT INTO {$tableName} (cfg_key, cfg_val) VALUES(
      'pwSeed', '{$pwSeed}'
    );";
    $wpdb->query($sql);
  }

  $tableName = "{$wpdb->prefix}unsta_kokyaku"; //テーブル名

  $r = $wpdb->get_results("SHOW TABLES FROM '" . DB_NAME . "' LIKE '$tableName'");
  if (!$r) {
    $sql = "CREATE TABLE {$tableName} (
      k_id int(11) unsigned  PRIMARY KEY  AUTO_INCREMENT,
      k_no int(11) unsigned,
      k_furi varchar($varchar_max),
      k_tel varchar($varchar_max),
      k_name varchar($varchar_max),
      k_version int(11) unsigned,
      k_json varchar($varchar_max),
      UNIQUE KEY index_no (k_no),
      KEY index_furi (k_furi),
      KEY index_tel (k_tel)
    ) {$wpdb->get_charset_collate()};";
    dbDelta($sql);
  }
}
add_shortcode('dbInit', 'sc_dbInit_func' );


// SQL を実行する SC
function sc_sql_func($atts) {
  if (!isset($atts['sql'])) return 'no sql';
  
  global $wpdb;

  $sql = $atts['sql'];
  if ($sql == 'show tables') $sql = "SHOW TABLES FROM " . DB_NAME;

  $r = $wpdb->get_results($sql);
  return json_encode($r);
}
add_shortcode('sql', 'sc_sql_func' );


// ACF から値を取得する SC
function sc_acf_func($atts) {
  if (isset($atts['field'])) {
    return get_field($atts['field']);
  }

  // 全フィールドの取得
  return json_encode(get_fields());
}
add_shortcode('acf', 'sc_acf_func' );


// 
function sc_test_func() {
  // $token = (session_status() == 2 && isset($_SESSION['react-token'])) ? $_SESSION['react-token'] : false;
  // if (!$token) {
  //   session_start();
  //   $token = md5(uniqid(rand(), TRUE));
  //   $_SESSION['react-token'] = $token;
  // }
  $obj = get_queried_object();  //現在表示しているページのオブジェクトを取得
  return json_encode($obj);
}
add_shortcode('scTest', 'sc_test_func' );


// 現在表示しているページのオブジェクトを json 形式で返す SC 
function sc_page2js_func() {
  $obj = get_queried_object();  //現在表示しているページのオブジェクトを取得
  return json_encode($obj);
}
add_shortcode('page2js', 'sc_page2js_func' );


// POST された Data を JSON 形式で返す SC
function sc_postData2js() {
  $raw = file_get_contents('php://input'); // POSTされた生のデータを受け取る
  $data = json_decode($raw); // json形式をphp連想配列に変換
  return json_encode($data); // php連想配列をjson形式に変換
}
add_shortcode('postData2js', 'sc_postData2js');


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
function sc_val2js($atts, $content) {
  $content = trim(do_shortcode($content));
  $content = preg_replace('/<\/?script>/', '', $content);

  $data = json_decode($content); // json形式をphp連想配列に変換
  $json = json_encode($data); // php連想配列をjson形式に変換
  return '<script>window._____val2js_____ = '. $json .';</script>';
}
add_shortcode('val2js', 'sc_val2js');


// React 等で表示する SC
function sc_jsComponent_func($atts) {
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

  $props = "window._____val2js_____";

  $apcu = isset($_COOKIE['unsta-cookie']) ? apcu_fetch($_COOKIE['unsta-cookie']) : false;
  $token = isset($apcu['token']) ? $apcu['token'] : false;
  if (!$token) {
    $key = md5(uniqid(rand(), true));
    setcookie('unsta-cookie', $key, time()+COOKIE_EXPIRES);
    $token = md5(uniqid(rand(), true));
    apcu_store($key, ['token' => $token], COOKIE_EXPIRES);
  }

  $id = md5(uniqid(rand(), true));
  $src =
    '<div id="'.$id.'"></div>'."\n".
    '<script type="module">'."\n".
    '(async function _() { '.
      "if (!window.unstaToken) {".
        "const r=await fetch('index.php?rest_route=/unsta/v1/post-api/unsta-token/-', {".
          "method: 'POST', mode: 'cors', credentials: 'include',".
          "headers:{'Content-Type': 'application/json'},". 
        "}); ".
        "const json=await r.json(); ".
        "window.unstaToken=json.unstaToken; ".
      "} ".
      "const src = await import('$jsfile'); ".
      "await src.$func($props, '$id'); ".
    "})();\n</script>";

  return $src;
}
add_shortcode('jsComponent', 'sc_jsComponent_func');
