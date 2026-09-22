<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$row = $pdo->query("
    SELECT 
        COUNT(DISTINCT d.baladiya_id) as distinct_doc_b,
        COUNT(DISTINCT CASE WHEN b.id IS NOT NULL THEN d.baladiya_id END) as matched_b
    FROM doctors d
    LEFT JOIN baladiyas b ON b.id = d.baladiya_id
    WHERE d.baladiya_id IS NOT NULL
")->fetch(PDO::FETCH_ASSOC);

echo "Distinct baladiyas in doctors: {$row['distinct_doc_b']}, matched in baladiyas table: {$row['matched_b']}\n";
