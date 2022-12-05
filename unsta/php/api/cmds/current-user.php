<?php

// ログイン中のユーザー（顧客）情報を取得する処理

// GET
function get($request) {
  $user = \Unsta::currentUser();
  $uid = $user['uid'];

  $data = [
    'id' => $uid,
  ];

  if ($uid && $request['arg'] == 'fields') {
    $kokyaku = get_postdata($uid);
    $data['name'] = $kokyaku['Title'];

    $db = \Unsta::database();
    
    $tpf = $db->prefix;
  
    // CF を取得する
    $sql = "SELECT meta_key, meta_value FROM {$tpf}postmeta
      WHERE post_id = {$uid} 
    ";
    $rows_cf = $db->get_results($sql);
    foreach ($rows_cf as $row) {
      $data[$row->meta_key] = $row->meta_value;
    }     
  }

  return ['data' => $data];
}

// POST
function post($request, $body) {
  $user = \Unsta::currentUser();
  $uid = $user['uid'];
  if (!$uid) throw new \Exception('no role');

  $data = json_decode($body); // json形式を PHP オブジェクトに変換

  $pass = $data->pass;
  if ($pass) {
    if (!preg_match('/^[a-zA-Z0-9!"#$%&\'()\\-=^~@\\[;:\\],.\\/\\|`{+*}<>?_]{8,1024}$/', $pass)) {
      throw new \Exception('bad pass');
    }
    if (!update_metadata('post', $uid, 'pass', wp_hash_password($pass))) {
      throw new \Exception("update failed");
    }
  }

  $mail = $data->mail;
  if ($mail) {
    if (strlen(!$mail) > 1024) throw new \Exception('bad mail');
    if (!update_metadata('post', $uid, 'mail', $mail)) {
      throw new \Exception("update failed");
    }
  }

  return ['data' => []];
}
