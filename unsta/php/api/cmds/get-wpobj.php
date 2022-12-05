<?php

// WPオブジェクト（投稿や固定ページなど）の情報を返す

// GET
function get($request) {
  // nonce がないと管理者と判断されないので注意
  if (!current_user_can('manage_options')) throw new \Exception('no role');

  $id = (int)$request['arg'];
  $data = get_postdata($id);

  $db = \Unsta::database();
  
  $tpf = $db->prefix;

  // CF を取得する

  $sql = "SELECT meta_key, meta_value FROM {$tpf}postmeta
    WHERE post_id = {$id} 
  ";
  $rows_cf = $db->get_results($sql);
  foreach ($rows_cf as $row) {
    $data[$row->meta_key] = $row->meta_value;
  }     

  return ['data' => $data];
}

// POST
function post($request, $body) {
  return ['data' => []];
}
