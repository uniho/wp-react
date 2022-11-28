<?php

// メールの変更 STEP 1

// GET
function get($request) {
  return ['data' => []];
}

// POST
function post($request, $body) {
  $data = json_decode($body); // json形式を PHP オブジェクトに変換

  $user = \Unsta::currentUser();
  $uid = $user['uid'];
  if (!$uid) throw new \Exception('no role');

  if (!$data->mail || strlen($data->mail) > 1024) throw new \Exception('bad mail');

  $mail = strtolower($data->mail);

  $hash = wp_generate_uuid4();
  $code = mt_rand(100000, 999999);

  // Flood Control
  \Unsta::flood()->register("modify-mail.confirm-code", RESETPASS_CHALLENGE_TIME, "{$code}-{$hash}-{$uid}-{$data->mail}");

  if (!wp_mail(
    $mail_to = $mail,
    $subject = "確認コード",
    $mail_body = "\n確認コード：$code\n\n"
  )) throw new \Exception("failed to send");

  return ['data' => ['hash' => $hash, ]];
}
