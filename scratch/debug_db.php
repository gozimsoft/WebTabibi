<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$clinicId = '058A1CA1-9818-4B14-A4C0-84A327D52DA3';
$doctorId = '30ED4658-AACE-4B5F-8EB7-D18EC9DE481C';

echo "Checking Clinic: $clinicId\n";
$stmt = $pdo->prepare("SELECT id, clinicname, status FROM clinics WHERE id = ?");
$stmt->execute([$clinicId]);
print_r($stmt->fetch(PDO::FETCH_ASSOC));

echo "\nChecking Doctor: $doctorId\n";
$stmt = $pdo->prepare("SELECT id, fullname, status FROM doctors WHERE id = ?");
$stmt->execute([$doctorId]);
print_r($stmt->fetch(PDO::FETCH_ASSOC));

echo "\nChecking Relationship:\n";
$stmt = $pdo->prepare("SELECT * FROM clinicsdoctors WHERE clinic_id = ? AND doctor_id = ?");
$stmt->execute([$clinicId, $doctorId]);
print_r($stmt->fetch(PDO::FETCH_ASSOC));
