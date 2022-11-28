<?php

// リセットパスワード STEP 2

// GET
function get($request) {
  return ['data' => []];
}

// POST
function post($request, $body) {
  $data = json_decode($body); // json形式を PHP オブジェクトに変換
  $uid = (int)$data->uid;
  $code = $data->code;
  $pass = $data->pass;
  $hash = $data->hash;
  $mail = $data->mail;
  if (!$uid ||
    !$code || strlen(!$code) > 10 ||
    !$hash || strlen(!$hash) > 100 ||
    !$mail || strlen(!$mail) > 1024
  ) throw new \Exception('bad params');

  if (!preg_match('/^[a-zA-Z0-9!"#$%&\'()\\-^@\\[;:\\],.\\/\\|`{+*}<>?_]{8,1024}$/', $pass)) {
    throw new \Exception('bad pass');
  }

  $CHALLENGE_MAX = 10; // チャレンジ回数
  if (!\Unsta::flood()->isAllowed("challenge.confirm-code", $CHALLENGE_MAX, RESETPASS_CHALLENGE_TIME, "{$hash}-{$uid}-{$mail}")) {
    // ERROR: チャレンジ回数を超えた
    throw new \Exception("over challenge");
  }
  \Unsta::flood()->register("challenge.confirm-code", RESETPASS_CHALLENGE_TIME, "{$hash}-{$uid}-{$mail}");

  if (\Unsta::flood()->isAllowed('reset-pass.confirm-code', 1, RESETPASS_CHALLENGE_TIME, "{$code}-{$hash}-{$uid}-{$mail}")) {
    // ERROR: "$CHALLENGE_TIME 分の制限時間を超えた"
    // or "code 未発行"
    // or "uuid 違う"
    // or "code 違う"
    sleep(3); // for brute force attack
    throw new \Exception("code mismatch");
  }

  if (!update_metadata('post', $uid, 'pass', wp_hash_password($pass))) {
    throw new \Exception("update failed");
  }

  // OK なのでログインする
  $apcu = \Unsta::apcuGetValue();
  $apcu['userid'] = $uid;
  \Unsta::apcuSetValue($apcu, COOKIE_EXPIRES);

  $ipAddr = $_SERVER["REMOTE_ADDR"];
  \Unsta::flood()->clear('login', "$uid-$ipAddr");
  \Unsta::flood()->clear('reset-pass', $uid);

  sleep(3); // for brute force attack
  return ['data' => []];
}
