<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "=== CHECKING WILAYAS & BALADIYAS IN DB ===\n";
$stmt = $pdo->query("SELECT id, num, namear, namefr FROM wilayas LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

$stmt = $pdo->query("SELECT id, wilaya_id, namear, namefr, postcode FROM baladiyas LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

$stmt = $pdo->query("SELECT id, namear, namefr FROM specialties ORDER BY namear");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
