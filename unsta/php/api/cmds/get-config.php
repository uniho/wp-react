<?php

// Config(設定)を取得する

// GET
function get($request) {
  $user = \Unsta::currentUser();
  $uid = (int)$user['uid'];

  if (!$uid) throw new \Exception('no role'); // ゲスト（ログインしていない）

  $db = \Unsta::database();
    
  $tpf = $db->prefix;

  $sql = "SELECT ID as id FROM {$tpf}posts
    WHERE post_type = 'config'AND post_title = %s 
  ";
  $row = $db->get_row($db->prepare($sql, $request['arg'])); 

  $data = false;
  if ($row) {
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
