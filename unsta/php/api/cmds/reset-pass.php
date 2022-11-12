<?php

// リセットパスワード

// GET
function get($request) {
  return ['data' => []];
}

// POST
function post($request, $body) {
  $data = json_decode($body); // json形式を PHP オブジェクトに変換

  $key = $_COOKIE['unsta-cookie'];
  $apcu = isset($key) ? apcu_fetch($key) : false;
  $uid = isset($apcu['userid']) ? $apcu['userid'] : 0;
  $count = isset($apcu['count']) ? $apcu['count'] : 0;

  // ユーザー検索
  global $wpdb;
  
  $sql = "SELECT a.ID as id FROM wp_posts a
    LEFT JOIN wp_postmeta b ON a.ID = b.post_id
    WHERE a.post_type = 'kokyaku' AND 
      b.meta_key ='account' AND b.meta_value = %s 
  ";
  $row = $wpdb->get_row($wpdb->prepare($sql, $data->name)); 

  if ($row && $data->pass == '1234') {
    // ログイン成功
    $apcu['userid'] = (int)$row->id;
    $apcu['count'] = 0; // チャレンジ回数をリセット
    apcu_store($key, $apcu, COOKIE_EXPIRES);
    return 'OK';
  }

  // ログイン失敗
  $apcu['count']++; // チャレンジ回数を増加
  apcu_store($key, $apcu, COOKIE_EXPIRES);
  sleep(10);
  return new WP_HTTP_Response('Sorry, unrecognized username or password.', 400);
}
