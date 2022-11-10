<?php

// ログイン処理
function post($request, $body) {
  $data = json_decode($body); // json形式を PHP オブジェクトに変換

  $key = $_COOKIE['unsta-cookie'];
  $apcu = isset($key) ? apcu_fetch($key) : false;
  $uid = isset($apcu['userid']) ? $apcu['userid'] : 0;
  $count = isset($apcu['count']) ? $apcu['count'] : 0;

  if ($data->name == 'abcd' && $data->pass == '1234') {
    // ログイン成功
    $apcu['userid'] = 1;
    $apcu['count'] = 0; // チャレンジ回数をリセット
    apcu_store($key, $apcu, COOKIE_EXPIRES);
    return 'OK';
  }

  // ログイン失敗
  $apcu['count']++; // チャレンジ回数を増加
  apcu_store($key, $apcu, COOKIE_EXPIRES);
  return new WP_HTTP_Response('Sorry, unrecognized username or password.', 400);
}
