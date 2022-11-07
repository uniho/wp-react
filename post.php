<?php

// POST

$header = getallheaders();

if (!isset($_SESSION['react-token']) || $header['X-CSRF-Token'] != $_SESSION['react-token']) {
  echo "bad token";
  exit;
}

$raw = file_get_contents('php://input'); // POSTされた生のデータを受け取る
$data = json_decode($raw); // json形式をphp変数に変換

$res = $data; // やりたい処理

// echoすると返せる
echo json_encode($res); // json形式にして返す
