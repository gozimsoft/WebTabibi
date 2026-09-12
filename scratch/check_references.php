<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "--- CHECKING REFERENCES TO SPECIALTIES ---\n";
// Check doctors
$stmt = $pdo->query("SELECT specialtie_id, count(*) as cnt FROM doctors GROUP BY specialtie_id");
echo "Doctors count per specialty:\n";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

// Check clinicsdoctors
$stmt = $pdo->query("SELECT specialtie_id, count(*) as cnt FROM clinicsdoctors GROUP BY specialtie_id");
echo "Clinicsdoctors count per specialty:\n";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

// Check doctorregistrations
$stmt = $pdo->query("SELECT specialtie_id, count(*) as cnt FROM doctorregistrations GROUP BY specialtie_id");
echo "Doctor registrations count per specialty:\n";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

// Check temp_doctors if exists
try {
    $stmt = $pdo->query("SELECT specialtie_id, count(*) as cnt FROM temp_doctors GROUP BY specialtie_id");
    echo "Temp doctors count per specialty:\n";
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "No temp_doctors or error: " . $e->getMessage() . "\n";
}
