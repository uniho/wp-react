<?php

// パスワードをハッシュ化して返す

// GET
function get($request) {
  return ['data' => []];
}

// POST
function post($request, $body) {
  $data = json_decode($body); // json形式を PHP オブジェクトに変換
  if (!$data->pass || strlen($data->pass) > 1024) {
    throw new \Exception('bad pass');
  }
  return ['data' => wp_hash_password($data->pass)];
}
