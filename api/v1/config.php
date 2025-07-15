<?php
// ملف: config.php

$host = '50.6.156.112';
$db   = 'vrtctpmy_DBTabibi';
$user = 'vrtctpmy_TabibAdmin'; // غيّره إذا كنت تستخدم اسم مستخدم آخر
$pass = 'TabibAdmin@2025';      // كلمة السر للمستخدم root

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("فشل الاتصال بقاعدة البيانات: " . $e->getMessage());
}
?>