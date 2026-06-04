<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();

echo "=== DESCRIBE reasons ===\n";
$stmt = $pdo->query("DESCRIBE reasons");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== DESCRIBE doctorsreasons ===\n";
$stmt = $pdo->query("DESCRIBE doctorsreasons");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== SAMPLE reasons ===\n";
$stmt = $pdo->query("SELECT * FROM reasons LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== SAMPLE doctorsreasons ===\n";
$stmt = $pdo->query("SELECT * FROM doctorsreasons LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== SAMPLE apointements ===\n";
$stmt = $pdo->query("SELECT id, reason_id FROM apointements WHERE reason_id IS NOT NULL LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
