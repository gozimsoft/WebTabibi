<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$stmt = $pdo->query("SELECT id, namear, namefr FROM specialties ORDER BY namear");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "=== ALL SPECIALTIES IN DATABASE (" . count($rows) . ") ===\n";
foreach ($rows as $i => $r) {
    $num = $i + 1;
    echo "[$num] AR: {$r['namear']} | FR: {$r['namefr']} (ID: {$r['id']})\n";
}
