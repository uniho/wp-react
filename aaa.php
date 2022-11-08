<?php
/*
Plugin Name: AAA
Plugin URI: https://www.aaa.net/
Description: AAA!
Author: Mr.AAA
Version: 1.0
Author URI: https://www.aaa.net/
*/
 
class AAA {
  var $table_name;
  public function __construct() {
    global $wpdb;
    $this->table_name = $wpdb->prefix . 'aaa_config';
    register_activation_hook (__FILE__, [$this, 'activate']);
  }

  function activate() {
    global $wpdb;
    $db_ver = '1.0';
    $installed_ver = get_option('aaa_version');
    if (version_compare($installed_ver, $db_ver) < 0) {
      $sql = "CREATE TABLE {$this->table_name} (
        cfg_key varchar(20)  PRIMARY KEY,
        cfg_val varchar(1024)
      ) {$wpdb->get_charset_collate()};";

      require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
      dbDelta($sql);

      // dbDelta() 使用上の注意
      // * 1 行につき、ひとつのフィールドを定義してください。〔訳注：ひとつの行に複数のフィールド定義を書くことはできません。さもなくば ALTER TABLE が正しく実行されず、プラグインのバージョンアップに失敗します。〕
      // * PRIMARY KEY というキーワードと、主キーの定義の間には、二つのスペースが必要です。
      // * INDEX という同義語ではなく、KEY というキーワードを使う必要があります。さらに最低ひとつの KEY を含めなければなりません。
      // * フィールド名のまわりにアポストロフィ（'）やバッククォート（`）を使ってはいけません。
      // * フィールドタイプはすべて小文字であること。
      // * SQL キーワード、例えば CREATE TABLE や UPDATE は、大文字であること。
      // * 長さパラメータを受け付けるすべてのフィールドに長さを指定すること。例えば int(11) のように。      dbDelta($sql);
      update_option('aaa_version', $db_ver);
    }

    $pwSeed = md5(uniqid(rand(), true));
    $r = $wpdb->get_results("SELECT * FROM {$this->table_name} WHERE cfg_key='pwSeed'");
    if (!$r) {
      $sql = "INSERT INTO {$this->table_name} (cfg_key, cfg_val) VALUES(
        'pwSeed', '{$pwSeed}'
      );";
      $wpdb->query($sql);
    }
  }
}

$exmeta = new AAA;
