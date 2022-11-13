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
  $hash = $data->hash;
  $mail = $data->mail;
  if (!$uid ||
    !$code || strlen(!$code) > 10 ||
    !$hash || strlen(!$hash) > 100 ||
    !$mail || strlen(!$mail) > 1024) throw new \Exception('bad params');

  if (!\Unsta::flood()->isAllowed("challenge.confirm-code", 10, 60*10, "{$hash}-{$uid}-{$mail}")) {
    // ERROR: チャレンジ回数を超えた
    throw new \Exception("over challenge");
  }
  \Unsta::flood()->register("challenge.confirm-code", 60*10, "{$hash}-{$uid}-{$mail}");

  if (\Unsta::flood()->isAllowed('reset-pass.confirm-code', 1, 60*10, "{$code}-{$hash}-{$uid}-{$mail}")) {
    // ERROR: "10分の制限時間を超えた"
    // or "code 未発行"
    // or "uuid 違う"
    // or "code 違う"
    throw new \Exception("code mismatch");
  }

  // OK
  \Unsta::flood()->clear('reset-pass', $uid);

  return ['data' => []];
}
