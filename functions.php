<?php

// dbDelta() を使えるようにする
require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

// 初期化処理
add_action('after_setup_theme', 'my_after_setup_theme');
function my_after_setup_theme() {
  global $wpdb;

  $tableName = "{$wpdb->prefix}aaa_config"; //テーブル名

  $r = $wpdb->get_results("SHOW TABLES FROM '" . DB_NAME . "' LIKE '$tableName'");
  if (!$r) {
    $sql = "CREATE TABLE {$tableName} (
      cfg_key int varchar(20)  PRIMARY KEY,
      cfg_val varchar(max)
    ) {$wpdb->get_charset_collate()};";
    dbDelta($sql);
  
    $pwSeed = md5(uniqid(rand(), true));
    $sql = "INSERT INTO {$tableName} (cfg_key, cfg_val) VALUES(
      'pwSeed', '{$pwSeed}'
    );";
    $wpdb->query($sql);
  }

  // $tableName = "{$wpdb->prefix}aaa_kokyaku"; //テーブル名

  // $wpdb->get_row("SHOW TABLES FROM '" . DB_NAME . "' LIKE '$tableName'");
  // if (!$wpdb->num_rows) {
  //   $sql = "CREATE TABLE {$tableName} (
  //     k_id int(11) unsigned  PRIMARY KEY  AUTO_INCREMENT,
  //     k_no int(11) unsigned,
  //     k_furi varchar(max),
  //     k_tel varchar(max),
  //     k_name varchar(max),
  //     k_version int,
  //     k_json varchar(max)
  //   ) {$wpdb->get_charset_collate()};";
  //   dbDelta($sql);
  
  //   $sql = "CREATE UNIQUE INDEX index_no ON {$tableName} (
  //     k_no
  //   );";
  //   dbDelta($sql);

  //   $sql = "CREATE INDEX index_furi ON {$tableName} (
  //     k_furi
  //   );";
  //   dbDelta($sql);

  //   $sql = "CREATE INDEX index_furi ON {$tableName} (
  //     k_tel
  //   );";
  //   dbDelta($sql);
  // }
}


// SQL を実行する SC
function sc_sql_func($atts) {
  if (!isset($atts['sql'])) return 'no sql';
  
  global $wpdb;
  $r = $wpdb->get_results($atts['sql']);
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
  $content = ltrim($content, '<script>');
  $content = rtrim($content, '</script>');

  $data = json_decode($content); // json形式をphp連想配列に変換
  $json = json_encode($data); // php連想配列をjson形式に変換
  return '<script>window._____val2js_____ = '. $json .';</script>';
}
add_shortcode('val2js', 'sc_val2js');


// React 等の準備をする SC
function sc_ReactJS_func($atts) {
  $atts = shortcode_atts([
    'src' => 'react.js',
    'func' => 'main',
  ], $atts);

  $jsfile = get_stylesheet_directory_uri() . '/' . $atts['src'];
  $func = $atts['func'];

  $token = isset($_COOKIE['wp-react-cookie']) ? apcu_fetch($_COOKIE['wp-react-cookie']) : false;
  if (!$token) {
    $expires = 60 * 60 * 24 * 7;
    $key = md5(uniqid(rand(), TRUE));
    setcookie('wp-react-cookie', $key, time()+$expires);
    $token = md5(uniqid(rand(), TRUE));
    apcu_store($key, $token, $expires);
  }

  $props = '{'.
    "postURI:'".get_stylesheet_directory_uri()."',".
    "token:'$token',".
    "val2js:window._____val2js_____,".
  '}';

  $src =
    '<div id="app"></div>'."\n".
    '<script type="module">'."\n".
    '(async function _() { '.
    'if (!window.React) {'.
    'const modules = await Promise.all(['.
      'import("https://jspm.dev/react@18.3"),'.
      'import("https://jspm.dev/react-dom@18.3/client"),'.
    ']); '.
    'window.React = modules[0].default; '.
    'window.ReactDOM = modules[1].default; '.
                'window.Suspense = React.Suspense; '.
                'window.Fragment = React.Fragment; '.
    '} '.
                'if (!window.html) {'.
                'const modules = await Promise.all(['.
                        'import("https://unpkg.com/htm@3.1?module"),'.
                        'import("https://cdn.skypack.dev/@emotion/css?min"),'.
                ']); '.
    'const htm = modules[0].default; '.
    'const {cx, css, keyframes, injectGlobal} = modules[1]; '.
    'window.html = htm.bind(React.createElement); '.
    'window.raw = window.styled = String.raw; '.
    'window.cx = cx; '.
    'window.css = css; '.
    'window.keyframes = keyframes; '.
    'window.injectGlobal = injectGlobal; '.
    '} '.
                "const src = await import('$jsfile'); ".
    "const App = await src.$func($props); ".
                "const root = ReactDOM.createRoot(document.getElementById('app')); " .
                "root.render(React.createElement(App)); " .
    "})();\n</script>";

  return $src;
}
add_shortcode('ReactJS', 'sc_ReactJS_func');
