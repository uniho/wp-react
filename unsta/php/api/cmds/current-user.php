<?php

// ログイン中のユーザー（顧客）情報を取得する処理

// GET
function get($request) {
  $user = Unsta::currentUser();

  return ['data' => [
    'id' => $user['uid'],
  ]];
}

// POST
function post($request, $body) {
  $user = Unsta::currentUser();
  if (!$user['uid']) throw new \Exception('no role');

  $data = json_decode($body); // json形式を PHP オブジェクトに変換

  global $wpdb;

  if ($data->pass) {
    require_once('../password.php');
    $passworder = new Password(1);
    $result = $wpdb->update($wpdb->postmeta, 
      ['meta_value' => $passworder->hash($data->pass)],
      ['post_id' => $user['uid'], 'meta_key' => 'pass']);
  }
  
  return ['data' => []];
}
