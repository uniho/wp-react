<?php

// 投稿(post) を取得する
// * WP管理者はすべての投稿を取得できる。
// * 顧客は自分の投稿を取得できる。
function post($request, $body) {
  $data = json_decode($body); // json形式を PHP オブジェクトに変換

  $user = Unsta::currentUser();

  if (!$user['uid']) {
    // ゲスト（ログインしていない）
    return ['error' => ['message' => 'no role']];
  }  

  // 
  return ['data' => [
    'id' => $uid,
  ]];
}
