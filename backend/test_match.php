<?php
require 'core/Database.php';
require 'core/Response.php';

$pdo = Database::getInstance();
$requestId = 'e2dd9971-c4fd-465c-b6e1-8657d10783e6';
$userId = '95b2633d-426a-4c58-b38f-ff3a64a4c5ec'; // user_id of the Clinic

$stmt = $pdo->prepare("SELECT * FROM ClinicsDoctors WHERE ID=? LIMIT 1");
$stmt->execute([$requestId]);
$req = $stmt->fetch();

echo "Req Clinic_ID: {$req['Clinic_ID']}\n";
echo "Req RequestedBy: {$req['RequestedBy']}\n";

$stmt2 = $pdo->prepare("SELECT Clinic_ID FROM ClinicRegistrations WHERE User_ID=? LIMIT 1");
$stmt2->execute([$userId]);
$myClinicId = $stmt2->fetchColumn() ?: '';

echo "My Clinic_ID: $myClinicId\n";

if ($req['Clinic_ID'] !== $myClinicId) {
    echo "Clinic ID mismatch!\n";
} else {
    echo "Clinic ID MATCHES!\n";
}

if (strtoupper($req['RequestedBy']) !== 'DOCTOR') {
    echo "RequestedBy mismatch! It is: " . strtoupper($req['RequestedBy']) . "\n";
} else {
    echo "RequestedBy MATCHES!\n";
}
