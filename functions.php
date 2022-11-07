<?php

// セッションの設定
function init_session_start(){
  // メモリ(APCu) に $_SESSION[] を保存するようにする
  class MySessionHandler implements SessionHandlerInterface{
    public function open($save_path, $name): bool {
      return true;
    }
    public function close(): bool {
      return true;
    }
    public function destroy($session_id): bool {
      if(apcu_exists($session_id)){
        return apcu_delete($session_id);
      }
      return true;
    }
    public function read($session_id): string {
      return apcu_fetch($session_id);
    }
    public function write($session_id, $session_data): bool {
      return apcu_store($session_id, $session_data, (int)ini_get('apc.ttl'));
    }
    public function gc($maxlifetime): bool {
      $list = apcu_cache_info();
      $ttl = (int)ini_get('apc.gc_ttl');
      foreach($list['cache_list'] as $v){
        if( ($v['access_time'] + $ttl) < $_SERVER['REQUEST_TIME']){
            apcu_delete($v['info']);
        }
      }
      return true;
    }
  }
  session_set_save_handler(new MySessionHandler(), true);
}
add_action('template_redirect', 'init_session_start');


// ACF から値を取得する SC
function sc_acf_func($atts) {
  return get_field($atts['field']);
}
add_shortcode('acf', 'sc_acf_func' );


// Session Token を取得する SC
function sc_sessionReactToken_func() {
  $token = (session_status() == 2 && isset($_SESSION['react-token'])) ? $_SESSION['react-token'] : false;
  if (!$token) {
    session_start();
    $token = md5(uniqid(rand(), TRUE));
    $_SESSION['react-token'] = $token;
  }
  return $token;
}
add_shortcode('sessionReactToken', 'sc_sessionReactToken_func' );


// POST された Data を JavaScript で使えるようにする SC
function sc_postData2JS() {
  $raw = file_get_contents('php://input'); // POSTされた生のデータを受け取る
  if ($raw) {
    $data = json_decode($raw); // json形式をphp変数に変換
    if ($data) {
      $postData = json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
      if ($postData) {
        return '<script>window.postData = '. $postData .';</script>';
      }
    }
  }
  return 'NO POST';
}
add_shortcode('postData2JS', 'sc_postData2JS');


// React 等の準備をする SC
function sc_ReactJS_func($atts) {
  $atts = shortcode_atts([
    'src' => 'react.js',
    'func' => 'main',
        ], $atts);

  $jsfile = get_stylesheet_directory_uri() . '/' . $atts['src'];
  $func = $atts['func'];

  $acf_fields = get_fields();
  $acf = "{";
  if ($acf_fields) {
     foreach ($acf_fields as $name => $value) {
       $acf .= "'$name':" . "'$value',";
     }
  }
  $acf .= "}";

  $token = (session_status() == 2 && isset($_SESSION['react-token'])) ? $_SESSION['react-token'] : false;
  if (!$token) {
    session_start();
    $token = md5(uniqid(rand(), TRUE));
    $_SESSION['react-token'] = $token;
  }

  $props = '{'.
    "acf:$acf,".
    "postURI:'".get_stylesheet_directory_uri()."',".
    "token:'$token',".
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
