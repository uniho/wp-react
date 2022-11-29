<?php

// WPオブジェクト（投稿や固定ページなど）の情報を返す

// GET
function get($request) {
  // nonce がないと管理者と判断されないので注意
  if (!current_user_can('manage_options')) throw new \Exception('no role');

  return ['data' => get_postdata((int)$request['arg'])];
}

// POST
function post($request, $body) {
  return ['data' => []];
}
