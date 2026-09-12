<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "=== ALL TABLES IN DB ===\n";
print_r($tables);
