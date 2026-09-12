<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "=== DESCRIBE reasons ===\n";
$stmt = $pdo->query("DESCRIBE `reasons`");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== DESCRIBE doctorsreasons ===\n";
$stmt = $pdo->query("DESCRIBE `doctorsreasons`");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== CURRENT ROWS IN reasons ===\n";
$stmt = $pdo->query("SELECT * FROM `reasons` LIMIT 10");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
echo "Total rows: " . $pdo->query("SELECT count(*) FROM reasons")->fetchColumn() . "\n";
