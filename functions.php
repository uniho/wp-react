<?php

// ACF から値を取得する SC
function sc_acf_func($atts) {
	return get_field($atts['field']);
}
add_shortcode('acf', 'sc_acf_func' );


// Session Token を取得する SC
function sc_sessionToken_func() {
	$token = isset($_SESSION['token']) ? $_SESSION['token'] : false;
	if (!$token) {
        session_start();
		$token = md5(uniqid(rand(), TRUE));
		$_SESSION['token'] = $token;
	}
	return $token;
}
add_shortcode('sessionToken', 'sc_sessionToken_func' );


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

	$token = isset($_SESSION['token']) ? $_SESSION['token'] : false;
	if (!$token) {
        session_start();
		$token = md5(uniqid(rand(), TRUE));
		$_SESSION['token'] = $token;
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
