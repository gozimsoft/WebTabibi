<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "=== CHECKING DOCTORS SAMPLE AND THEIR SPECIALTIES ===\n";
$stmt = $pdo->query("SELECT d.id, d.fullname, d.specialtie_id, s.namear, s.namefr 
                     FROM doctors d 
                     LEFT JOIN specialties s ON d.specialtie_id = s.id 
                     LIMIT 20");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== TOTAL DOCTORS IN DB ===\n";
$stmt = $pdo->query("SELECT COUNT(*) FROM doctors");
echo "Count: " . $stmt->fetchColumn() . "\n";
