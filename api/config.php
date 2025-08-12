<?php
// ملف: config.php

$host = '162.241.253.189';
$db   = 'kutoqkmy_sale';
$user = 'kutoqkmy_admin'; // غيّره إذا كنت تستخدم اسم مستخدم آخر
$pass = 'Adel@2023';      // كلمة السر للمستخدم root

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  //    echo "✅ تم الاتصال بقاعدة البيانات بنجاح.";
} catch (PDOException $e) {
    die("فشل الاتصال بقاعدة البيانات: " . $e->getMessage());
}
?>
