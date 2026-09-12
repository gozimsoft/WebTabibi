<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $t) {
    $cnt = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
    echo "$t: $cnt rows\n";
}
