<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$pdo = Database::getInstance();

// 1. Check a doctor
$doc = $pdo->query('SELECT d.id, d.user_id, d.latitude, d.longitude, u.username FROM doctors d JOIN users u ON u.id = d.user_id WHERE d.status = "APPROVED" LIMIT 1')->fetch(PDO::FETCH_ASSOC);
echo "Doctor before update:\n";
print_r($doc);

// Simulate what DoctorController::updateProfile does:
$allowed = [
    'fullname', 'email', 'phone', 'fix', 'cnas', 'casnos', 'speakinglanguage', 
    'rpps', 'numregister', 'pricing', 'degrees', 'academytitles', 
    'postcode', 'specialtie_id', 'nin', 'presentation', 'education',
    'address', 'latitude', 'longitude'
];

$data = [
    'latitude' => 36.7538,
    'longitude' => 3.0588,
    'address' => 'Test Address 123'
];

$fields = [];
$values = [];
foreach ($allowed as $field) {
    if (array_key_exists($field, $data)) {
        $val = $data[$field];
        $fields[] = "`$field` = ?";
        $values[] = $val;
    }
}
$values[] = $doc['id'];
$sql = "UPDATE doctors SET " . implode(', ', $fields) . " WHERE id = ?";
echo "SQL: $sql\n";
echo "Values: " . json_encode($values) . "\n";
$stmt = $pdo->prepare($sql);
$res = $stmt->execute($values);
echo "Execute result: " . ($res ? "TRUE" : "FALSE") . "\n";

$docAfter = $pdo->query('SELECT d.id, d.user_id, d.latitude, d.longitude, d.address FROM doctors d WHERE d.id = "' . $doc['id'] . '"')->fetch(PDO::FETCH_ASSOC);
echo "Doctor after update:\n";
print_r($docAfter);

// 2. Check a clinic
$clinic = $pdo->query('SELECT c.id, c.user_id, c.latitude, c.longitude, c.address FROM clinics c LIMIT 1')->fetch(PDO::FETCH_ASSOC);
echo "\nClinic before update:\n";
print_r($clinic);

$allowedClinic = ['clinicname', 'email', 'phone', 'address', 'notes', 'fax', 'website', 'typeclinic', 'cliniccoordinates', 'latitude', 'longitude', 'services', 'postcode', 'aboutclinic', 'hospitalization', 'hiderating', 'emergency', 'ambulances'];
$dataClinic = [
    'latitude' => '36.7538',
    'longitude' => '3.0588'
];
$fields = [];
$values = [];
foreach ($allowedClinic as $field) {
    if (array_key_exists($field, $dataClinic)) {
        $val = $dataClinic[$field];
        $fields[] = "`$field` = ?";
        $values[] = $val;
    }
}
$values[] = $clinic['id'];
$sql = "UPDATE clinics SET " . implode(', ', $fields) . " WHERE id = ?";
$stmt = $pdo->prepare($sql);
$res = $stmt->execute($values);
echo "Clinic execute result: " . ($res ? "TRUE" : "FALSE") . "\n";

$clinicAfter = $pdo->query('SELECT c.id, c.user_id, c.latitude, c.longitude FROM clinics c WHERE c.id = "' . $clinic['id'] . '"')->fetch(PDO::FETCH_ASSOC);
echo "Clinic after update:\n";
print_r($clinicAfter);
