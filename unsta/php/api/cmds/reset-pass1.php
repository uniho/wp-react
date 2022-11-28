<?php

// リセットパスワード STEP 1

// GET
function get($request) {
  return ['data' => []];
}

// POST
function post($request, $body) {
  $data = json_decode($body); // json形式を PHP オブジェクトに変換

  $user = \Unsta::currentUser();
  $uid = $user['uid'];

  if ($uid) throw new \Exception('no bad');

  if (!$data->mail || strlen($data->mail) > 1024) throw new \Exception('bad mail');

  $uid = false;
  $mail = false;

  $db = \Unsta::database();

  $sql = "SELECT a.ID as id FROM wp_posts a
    LEFT JOIN wp_postmeta b ON a.ID = b.post_id
    WHERE a.post_type = 'kokyaku' AND b.meta_key ='account' AND b.meta_value = %s 
  ";
  $row = $db->get_row($db->prepare($sql, $data->mail)); 
  if ($row) $uid = $row->id;

  $sql = "SELECT a.ID as id, b.meta_value FROM wp_posts a
    LEFT JOIN wp_postmeta b ON a.ID = b.post_id
    WHERE a.post_type = 'kokyaku' AND b.meta_key ='mail' AND b.meta_value = %s 
  ";
  $row = $db->get_row($db->prepare($sql, $data->mail)); 
  if ($row) {
    $uid = $row->id;
    $mail = $row->meta_value;
  }  

  if (!$uid) throw new \Exception('unknown mail');
  
  if (!$mail) {
    $sql = "SELECT a.ID as id, b.meta_value FROM wp_posts a
      LEFT JOIN wp_postmeta b ON a.ID = b.post_id
      WHERE a.post_type = 'kokyaku' AND b.meta_key ='mail' AND a.ID = %d 
    ";
    $row = $db->get_row($db->prepare($sql, $uid)); 
    if (!$row) throw new \Exception('unknown mail');
    $mail = $row->meta_value;
  }

  if (!$mail) throw new \Exception('no mail');

  $passHash = get_metadata('post', $uid, 'pass', true); // 空白なら flood Control しない

  if ($passHash && !\Unsta::flood()->isAllowed('reset-pass', 1, 60*10, $uid)) {
    // ERROR: 10分以内にすでに確認コード発行済み
    throw new \Exception("per 10 min");
  }

  if ($passHash && !\Unsta::flood()->isAllowed('reset-pass', 5, 60*60*24, $uid)) {
    // ERROR: 5回/1日、確認コード発行済み
    throw new \Exception("per 1 day");
  }

  if ($passHash && !\Unsta::flood()->isAllowed('reset-pass', 10, 60*60*24*30, $uid)) {
    // ERROR: 10回/1月、確認コード発行済み
    throw new \Exception("per 1 month");
  }

  \Unsta::flood()->register('reset-pass', 60*60*24*30, $uid);

  $hash = wp_generate_uuid4();
  $code = mt_rand(100000, 999999);

  // Flood Control
  \Unsta::flood()->register("reset-pass.confirm-code", RESETPASS_CHALLENGE_TIME, "{$code}-{$hash}-{$uid}-{$data->mail}");

  if (!wp_mail(
    $mail_to = $mail,
    $subject = "確認コード",
    $mail_body = "\n確認コード：$code\n\n"
  )) throw new \Exception("failed to send");

  return ['data' => ['uid' => $uid, 'hash' => $hash, ]];
}
