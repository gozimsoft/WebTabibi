<?php
require_once __DIR__ . '/../backend/config/Database.php';

$pdo = new PDO(
    sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET),
    DB_USER, DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

echo "=== SHOW CREATE TABLE specialties ===\n";
$stmt = $pdo->query("SHOW CREATE TABLE `specialties`");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
echo $row['Create Table'] . "\n\n";

echo "=== SHOW CREATE TABLE reasons ===\n";
$stmt = $pdo->query("SHOW CREATE TABLE `reasons`");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
echo $row['Create Table'] . "\n\n";

echo "=== ALL SPECIALTIES IN REMOTE DB ===\n";
$stmt = $pdo->query("SELECT id, namear, namefr FROM `specialties` ORDER BY id");
$specs = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($specs as $s) {
    echo "{$s['id']} | {$s['namear']} | {$s['namefr']}\n";
}

echo "\nTotal specialties: " . count($specs) . "\n";

echo "=== SAMPLE REASONS IN REMOTE DB ===\n";
$stmt = $pdo->query("SELECT id, name, namear, namefr, specialtie_id FROM `reasons` LIMIT 10");
$reasons = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($reasons);
echo "Total reasons: " . $pdo->query("SELECT count(*) FROM reasons")->fetchColumn() . "\n";
