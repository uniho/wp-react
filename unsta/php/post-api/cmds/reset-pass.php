<?php

// パスワードリセット処理
function post($request, $body) {
  $data = json_decode($body); // json形式を PHP オブジェクトに変換

  $key = $_COOKIE['unsta-cookie'];
  $apcu = isset($key) ? apcu_fetch($key) : false;
  $uid = isset($apcu['userid']) ? $apcu['userid'] : 0;
  $count = isset($apcu['count']) ? $apcu['count'] : 0;

  // ユーザー検索
  global $wpdb;
  
  // http://wpdocs.osdn.jp/%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9%E6%A7%8B%E9%80%A0#Table:_wp_users
  // https://wp-doctor.jp/blog/2020/03/26/%E3%83%AF%E3%83%BC%E3%83%89%E3%83%97%E3%83%AC%E3%82%B9%E3%81%AEwpdb%E3%81%A7sql%E3%82%92%E5%AE%9F%E8%A1%8C%E3%81%99%E3%82%8B%E6%8A%80%EF%BC%95%E9%81%B8/
  $sql = "SELECT a.ID as id FROM wp_posts a
    LEFT JOIN wp_postmeta b ON a.ID = b.post_id
    LEFT JOIN (SELECT sub_c.object_id FROM wp_terms sub_a
      LEFT JOIN wp_term_taxonomy sub_b ON sub_a.term_id = sub_b.term_id
      LEFT JOIN wp_term_relationships sub_c ON sub_b.term_taxonomy_id = sub_c.term_taxonomy_id
      WHERE sub_b.taxonomy = 'category' AND sub_a.name = 'kokyaku'                            
    ) c ON a.ID = c.object_id
    WHERE a.post_type = 'post' AND 
      b.meta_key ='account' AND b.meta_value = %s 
  ";
  // https://agohack.com/wpdb-select-with-prepare/
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
