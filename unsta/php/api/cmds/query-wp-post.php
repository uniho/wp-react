<?php

// 投稿(post) を取得する

// GET
// * WP管理者はすべての投稿を取得できる。
// * 顧客は自分の投稿を取得できる。
// * ゲストは何もできない。
function get($request) {
  $user = \Unsta::currentUser();

  if (!$user['uid']) {
    // ゲスト（ログインしていない）
    throw new \Exception('no role');
  }  

  $db = \Unsta::database();
    
  $tpf = $db->prefix;

  $sql = "SELECT a.ID as id, a.post_title, a.post_content FROM {$tpf}posts a
    LEFT JOIN {$tpf}postmeta b ON a.ID = b.post_id
    WHERE a.post_type = 'post' AND b.meta_key = 'kid' AND b.meta_value = %s 
  ";
  $row = $db->get_row($db->prepare($sql, $user['uid'])); 

  $data = [];
  if ($row) {
    $data['touch_id'] = (int)$row->id;
    $data['title'] = $row->post_title;
    $data['content'] = $row->post_content;

    // CF を取得する
    $sql = "SELECT meta_key, meta_value FROM {$tpf}postmeta
      WHERE post_id = {$row->id} 
    ";
    $rows_cf = $db->get_results($sql);
    foreach ($rows_cf as $row) {
      $data[$row->meta_key] = $row->meta_value;
    }     
  }
  
  return ['data' => $data];
}

// POST
function post($request) {
  return ['data' => []];
}
