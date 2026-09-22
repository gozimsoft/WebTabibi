<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$pdo->exec("DROP TABLE IF EXISTS bak_baladiyas_2026");
$pdo->exec("CREATE TABLE bak_baladiyas_2026 AS SELECT * FROM baladiyas");

$pdo->exec("DROP TABLE IF EXISTS bak_wilayas_2026");
$pdo->exec("CREATE TABLE bak_wilayas_2026 AS SELECT * FROM wilayas");

$bCnt = $pdo->query("SELECT COUNT(*) FROM bak_baladiyas_2026")->fetchColumn();
$wCnt = $pdo->query("SELECT COUNT(*) FROM bak_wilayas_2026")->fetchColumn();

echo "Backup created successfully!\n";
echo "bak_baladiyas_2026: $bCnt rows\n";
echo "bak_wilayas_2026: $wCnt rows\n";
