<?php

// ログイン処理

// GET
function get($request) {
  return ['data' => []];
}

// POST
function post($request, $body) {
  try {
    $data = json_decode($body); // json形式を PHP オブジェクトに変換
    if (!$data->name || !$data->pass || strlen($data->name) > 1024 || strlen($data->pass) > 1024) {
      throw new \Exception('Bad username or password.');
    }

    $key = $_COOKIE['unsta-cookie'];
    $apcu = isset($key) ? apcu_fetch($key) : false;
    $uid = isset($apcu['userid']) ? $apcu['userid'] : 0;

    // ユーザー検索
    $db = \Unsta::database();
    
    $tpf = $db->prefix;
    $sql = "SELECT a.ID as id FROM {$tpf}posts a
      LEFT JOIN {$tpf}postmeta b ON a.ID = b.post_id
      WHERE a.post_type = 'kokyaku' AND b.meta_key ='account' AND b.meta_value = %s 
    ";
    $row = $db->get_row($db->prepare($sql, $data->name)); 

    if ($row) {
      // アカウントは存在した
      $uid = (int)$row->id;
      $passHash = get_metadata('post', $uid, 'pass', true);
      if ($row && $passHash && wp_check_password($data->pass, $passHash)) {
        // パスワードもOK なのでログイン成功
        $apcu['userid'] = $uid;
        // $apcu['count'] = 0; // チャレンジ回数をリセット
        apcu_store($key, $apcu, COOKIE_EXPIRES);
        sleep(3); // for brute force attack
        return 'OK';
      }
    }

    // ログイン失敗
    // $apcu['count']++; // チャレンジ回数を増加
    // apcu_store($key, $apcu, COOKIE_EXPIRES);
    sleep(3); // for brute force attack
    throw new \Exception('Sorry, unrecognized username or password.');
  } catch (\Exception $e) {
    return new WP_HTTP_Response($e->getMessage(), 400);
  }
}
