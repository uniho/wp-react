<?php

// POST

$token = isset($_SERVER['HTTP_X_CSRF_TOKEN']) ? $_SERVER['HTTP_X_CSRF_TOKEN'] : false;
$apcu = isset($_COOKIE['wp-react-cookie']) ? apcu_fetch($_COOKIE['wp-react-cookie']) : false;

if (!isset($_COOKIE['wp-react-cookie']) || !isset($apcu['token']) || !$token || $token !== $apcu['token']) {
  echo "bad token";
  exit;
}

$raw = file_get_contents('php://input'); // POSTされた生のデータを受け取る

$data = json_decode($raw); // json形式をphp変数に変換

$res = $data; // やりたい処理

// echoすると返せる
echo json_encode($res); // json形式にして返す
