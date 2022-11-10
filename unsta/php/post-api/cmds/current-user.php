<?php

// ログイン中のユーザー（顧客）情報を取得する処理
function post($request, $body) {
  $data = json_decode($body); // json形式を PHP オブジェクトに変換

  $key = $_COOKIE['unsta-cookie'];
  $apcu = isset($key) ? apcu_fetch($key) : false;
  $uid = isset($apcu['userid']) ? $apcu['userid'] : 0;

  if (!$uid) {
    // ゲスト（ログインしていない）
    return ['data' => ['id' => 0]];
  }  

  // 
  return ['data' => [
    'id' => $uid,
  ]];
}
