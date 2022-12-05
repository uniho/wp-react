<?php

// WPオブジェクト（現在は固定ページのみ）の slug と id を取得する

// GET
function get($request) {
  $posts = get_posts(['post_type' => 'page']);
  $res = [];
	foreach ($posts as $post) {
    $res[$post->post_name] = $post->ID;
    // $post = get_page_by_path($page_path = $request['arg'], $post_type = 'page');
  }
  return ['data' => $res];
}

// POST
function post($request, $body) {
  return ['data' => []];
}
