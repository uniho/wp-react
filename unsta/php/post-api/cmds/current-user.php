<?php

// ログイン中のユーザー（顧客）情報を取得する処理
function post($request, $body) {
  $data = json_decode($body); // json形式を PHP オブジェクトに変換

  $user = Unsta::currentUser();

  return ['data' => [
    'id' => $user['uid'],
  ]];
}
