<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$pdo = Database::getInstance();

echo "=== TESTING DOCTOR UPDATE ===\n";
$doc = $pdo->query('SELECT d.id, d.user_id, d.latitude, d.longitude FROM doctors d WHERE d.status = "APPROVED" LIMIT 1')->fetch(PDO::FETCH_ASSOC);

// Test updating with float
$allowed = [
    'fullname', 'email', 'phone', 'fix', 'cnas', 'casnos', 'speakinglanguage', 
    'rpps', 'numregister', 'pricing', 'degrees', 'academytitles', 
    'postcode', 'specialtie_id', 'nin', 'presentation', 'education',
    'address', 'latitude', 'longitude'
];

$data = [
    'latitude' => 36.7538,
    'longitude' => 3.0588
];

$fields = [];
$values = [];
foreach ($allowed as $field) {
    if (array_key_exists($field, $data)) {
        $val = $data[$field];
        if ($field === 'latitude' || $field === 'longitude') {
            if ($val === '' || $val === null || (is_string($val) && trim($val) === '')) {
                $val = null;
            } elseif (is_numeric($val)) {
                $val = (float)$val;
            } else {
                $val = null;
            }
        }
        $fields[] = "`$field` = ?";
        $values[] = $val;
    }
}
$values[] = $doc['id'];
$stmt = $pdo->prepare("UPDATE doctors SET " . implode(', ', $fields) . " WHERE id = ?");
$res = $stmt->execute($values);
echo "Doctor float update: " . ($res ? "OK" : "FAIL") . "\n";

$savedDoc = $pdo->query('SELECT latitude, longitude FROM doctors WHERE id = "' . $doc['id'] . '"')->fetch(PDO::FETCH_ASSOC);
print_r($savedDoc);

echo "\n=== TESTING CLINIC UPDATE ===\n";
$clinic = $pdo->query('SELECT c.id, c.latitude, c.longitude FROM clinics c JOIN users u ON u.id = c.user_id WHERE u.username = "saint_germain_e24a93" LIMIT 1')->fetch(PDO::FETCH_ASSOC);
$allowedClinic = ['clinicname', 'email', 'phone', 'address', 'notes', 'fax', 'website', 'typeclinic', 'cliniccoordinates', 'latitude', 'longitude', 'services', 'postcode', 'aboutclinic', 'hospitalization', 'hiderating', 'emergency', 'ambulances'];

$dataClinic = [
    'latitude' => '36.752500',
    'longitude' => '3.059200'
];

$fields = [];
$values = [];
foreach ($allowedClinic as $field) {
    if (array_key_exists($field, $dataClinic)) {
        $val = $dataClinic[$field];
        if ($field === 'latitude' || $field === 'longitude') {
            if ($val === '' || $val === null || (is_string($val) && trim($val) === '')) {
                $val = null;
            } elseif (is_numeric($val)) {
                $val = (string)(float)$val;
            } else {
                $val = null;
            }
        }
        $fields[] = "`$field` = ?";
        $values[] = $val;
    }
}
$values[] = $clinic['id'];
$stmt = $pdo->prepare("UPDATE clinics SET " . implode(', ', $fields) . " WHERE id = ?");
$res = $stmt->execute($values);
echo "Clinic update: " . ($res ? "OK" : "FAIL") . "\n";

$savedClinic = $pdo->query('SELECT latitude, longitude FROM clinics WHERE id = "' . $clinic['id'] . '"')->fetch(PDO::FETCH_ASSOC);
print_r($savedClinic);
