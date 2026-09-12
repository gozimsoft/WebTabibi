<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();

echo "=== VERIFYING SPECIALTIES TABLE ===\n";
$stmt = $pdo->query("SELECT s.id, s.namear, s.namefr, COUNT(d.id) as doc_count 
                     FROM specialties s 
                     LEFT JOIN doctors d ON d.specialtie_id = s.id 
                     GROUP BY s.id, s.namear, s.namefr 
                     ORDER BY s.namear");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Total rows in specialties table: " . count($rows) . "\n\n";

$i = 1;
foreach ($rows as $r) {
    printf("%2d. ID: %s | AR: %-35s | FR: %-40s | Docs: %d\n", 
        $i++, $r['id'], $r['namear'], $r['namefr'], $r['doc_count']);
}

echo "\n=== CHECKING IF ANY DOCTOR HAS UNMATCHED SPECIALTY ===\n";
$stmt = $pdo->query("SELECT COUNT(*) FROM doctors d LEFT JOIN specialties s ON d.specialtie_id = s.id WHERE s.id IS NULL AND d.specialtie_id IS NOT NULL AND d.specialtie_id != ''");
$unmatched_docs = $stmt->fetchColumn();
echo "Doctors with unmatched specialtie_id: $unmatched_docs\n";

echo "\n=== CHECKING TOTAL MATCHED DOCTORS ===\n";
$stmt = $pdo->query("SELECT COUNT(*) FROM doctors d INNER JOIN specialties s ON d.specialtie_id = s.id");
$matched_docs = $stmt->fetchColumn();
echo "Doctors with matched specialtie_id: $matched_docs\n";
