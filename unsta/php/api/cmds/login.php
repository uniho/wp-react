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
      throw new \Exception('bad params');
    }

    $apcu = \Unsta::apcuGetValue();
    $uid = isset($apcu['userid']) ? $apcu['userid'] : 0;
    if ($uid) throw new \Exception('no bad');

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
        \Unsta::apcuSetValue($apcu, COOKIE_EXPIRES);
        sleep(3); // for brute force attack
        return 'OK';
      }

      // ログイン失敗 ~ user id 単位での Flood Control
      if (!\Unsta::flood()->isAllowed('login', 10, 60*60, $uid)) {
        // ERROR: 10回/1時間、ログイン失敗した
        throw new \Exception("per 1 hour");
      }
  
      if (!\Unsta::flood()->isAllowed('login', 20, 60*60*24, $uid)) {
        // ERROR: 20回/1日、ログイン失敗した
        throw new \Exception("per 1 day");
      }
  
      if (!\Unsta::flood()->isAllowed('login', 30, 60*60*24*7, $uid)) {
        // ERROR: 30回/1週、ログイン失敗した
        throw new \Exception("per 1 week");
      }
  
      \Unsta::flood()->register('login', 60*60*24*7, $uid);
    }

    // ログイン失敗 ~ IP 単位での Flood Control
    if (!\Unsta::flood()->isAllowed('login', 10, 60*60)) {
      // ERROR: 10回/1時間、ログイン失敗した
      throw new \Exception("per 1 hour");
    }

    if (!\Unsta::flood()->isAllowed('login', 20, 60*60*24)) {
      // ERROR: 20回/1日、ログイン失敗した
      throw new \Exception("per 1 day");
    }

    if (!\Unsta::flood()->isAllowed('login', 30, 60*60*24*7)) {
      // ERROR: 30回/1週、ログイン失敗した
      throw new \Exception("per 1 week");
    }

    \Unsta::flood()->register('login', 60*60*24*7);

    sleep(3); // for brute force attack
    throw new \Exception('Sorry, unrecognized username or password.');
  } catch (\Exception $e) {
    return new WP_HTTP_Response($e->getMessage(), 400);
  }
}
