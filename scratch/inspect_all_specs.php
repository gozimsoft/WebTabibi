<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "=== ALL SPECIALTIES IN DB ===\n";
$stmt = $pdo->query("SELECT s.id, s.namear, s.namefr, COUNT(d.id) as doc_count 
                     FROM specialties s 
                     LEFT JOIN doctors d ON d.specialtie_id = s.id 
                     GROUP BY s.id, s.namear, s.namefr
                     ORDER BY s.namear");
$specs = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($specs as $s) {
    echo "ID: {$s['id']} | AR: {$s['namear']} | FR: {$s['namefr']} | Doctors: {$s['doc_count']}\n";
}

echo "\n=== DOCTORS WITH UNMATCHED SPECIALTIES ===\n";
$stmt = $pdo->query("SELECT d.specialtie_id, COUNT(*) as cnt 
                     FROM doctors d 
                     LEFT JOIN specialties s ON d.specialtie_id = s.id 
                     WHERE s.id IS NULL 
                     GROUP BY d.specialtie_id");
$unmatched = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($unmatched);
