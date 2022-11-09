<?php

function post($request, $body) {
  $data = json_decode($body); // json形式を PHP オブジェクトに変換

  $data->id = $request['arg']; 
  return $data; // 自動的に JSON 形式に変換される 
}
