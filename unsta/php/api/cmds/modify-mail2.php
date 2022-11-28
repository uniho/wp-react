<?php

// メールの変更 STEP 2

// GET
function get($request) {
  return ['data' => []];
}

// POST
function post($request, $body) {
  $user = \Unsta::currentUser();
  $uid = $user['uid'];
  if (!$uid) throw new \Exception('no role');

  $data = json_decode($body); // json形式を PHP オブジェクトに変換
  $code = $data->code;
  $hash = $data->hash;
  $mail = strtolower($data->mail);
  if (
    !$code || strlen(!$code) > 10 ||
    !$hash || strlen(!$hash) > 100 ||
    !$mail || strlen(!$mail) > 1024
  ) throw new \Exception('bad params');

  $CHALLENGE_MAX = 10; // チャレンジ回数
  if (!\Unsta::flood()->isAllowed("challenge.confirm-code", $CHALLENGE_MAX, RESETPASS_CHALLENGE_TIME, "{$hash}-{$uid}-{$mail}")) {
    // ERROR: チャレンジ回数を超えた
    throw new \Exception("over challenge");
  }
  \Unsta::flood()->register("challenge.confirm-code", RESETPASS_CHALLENGE_TIME, "{$hash}-{$uid}-{$mail}");

  if (\Unsta::flood()->isAllowed('modify-mail.confirm-code', 1, RESETPASS_CHALLENGE_TIME, "{$code}-{$hash}-{$uid}-{$mail}")) {
    // ERROR: "$CHALLENGE_TIME 分の制限時間を超えた"
    // or "code 未発行"
    // or "uuid 違う"
    // or "code 違う"
    sleep(3); // for brute force attack
    throw new \Exception("code mismatch");
  }

  $lock = \Unsta::lock();
  $lockname = "LOCK_CONFIRM_MAIL_{$mail}";
  if ($lock->wait($lockname, 30) || !$lock->acquire($lockname, 30)) {
    // ERROR: ロックタイムアウト
    throw new \Exception("lock timeout");
  }

  try {
    $db = \Unsta::database();

    $sql = "SELECT a.ID as id FROM wp_posts a
      LEFT JOIN wp_postmeta b ON a.ID = b.post_id
      WHERE a.post_type = 'kokyaku' AND b.meta_key ='account'
      AND b.meta_value = %s AND a.ID != %d 
    ";
    $row = $db->get_row($db->prepare($sql, $mail, $uid)); 
    if ($row) throw new \Exception('mail exists');

    $sql = "SELECT a.ID as id FROM wp_posts a
      LEFT JOIN wp_postmeta b ON a.ID = b.post_id
      WHERE a.post_type = 'kokyaku' AND b.meta_key ='mail'
      AND b.meta_value = %s AND a.ID != %d 
    ";
    $row = $db->get_row($db->prepare($sql, $mail, $uid)); 
    if ($row) throw new \Exception('mail exists');

    $tr = $db->startTransaction();

    if (!update_metadata('post', $uid, 'account', $mail)) {
      $tr->rollback();
      throw new \Exception("update failed");
    }
  
    if (!update_metadata('post', $uid, 'mail', $mail)) {
      $tr->rollback();
      throw new \Exception("update failed");
    }
  
  } final {
    $lock->release($lockname);
  }

  sleep(3); // for brute force attack
  return ['data' => []];
}
