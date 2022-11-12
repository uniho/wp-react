<?php

// ログオフ処理

// GET
function get($request) {
  $key = $_COOKIE['unsta-cookie'];
  $apcu = isset($key) ? apcu_fetch($key) : false;
  if (isset($apcu)) {
    $apcu['userid'] = 0;
    apcu_store($key, $apcu, COOKIE_EXPIRES);
  }  
  return ['data' => "OK"];
}


// POST
function post($request, $body) {
  return ['data' => []];
}
