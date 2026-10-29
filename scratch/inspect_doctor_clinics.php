<?php
require 'backend/config/database.php';
require 'backend/core/Database.php';

$pdo = Database::getInstance();
$userId = '2b780a1b-de0a-4170-9fc1-191ac174d4ad';
$doctorId = 'b481adaa-9da3-4893-91eb-2462510b4eb4';

// Check user
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
echo "User: " . ($user ? $user['username'] . " (usertype " . $user['usertype'] . ")" : "NOT FOUND") . "\n";

// Check doctor
$stmt = $pdo->prepare("SELECT * FROM doctors WHERE id = ?");
$stmt->execute([$doctorId]);
$doc = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Doctor: " . ($doc ? $doc['fullname'] : "NOT FOUND") . "\n";

// Check clinics linked to this doctor
$stmt = $pdo->prepare("
    SELECT c.*, cd.id as clinicsdoctor_id, cd.status as affiliation_status
    FROM clinics c
    JOIN clinicsdoctors cd ON cd.clinic_id = c.id
    WHERE cd.doctor_id = ?
");
$stmt->execute([$doctorId]);
$clinics = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Clinics linked to doctor: " . count($clinics) . "\n";
foreach ($clinics as $c) {
    echo "Clinic ID: {$c['id']} | Name: {$c['clinicname']} | Owner user: {$c['user_id']} | Status: {$c['affiliation_status']}\n";
}
