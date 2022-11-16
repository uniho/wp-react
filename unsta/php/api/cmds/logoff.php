<?php

// ログオフ処理

// GET
function get($request) {
  $apcu = \Unsta::apcuGetValue();
  if (isset($apcu)) {
    $apcu['userid'] = 0;
    \Unsta::apcuSetValue($apcu, COOKIE_EXPIRES);
  }  
  return ['data' => "OK"];
}


// POST
function post($request, $body) {
  return ['data' => []];
}
