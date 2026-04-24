<?php
require 'core/Database.php';
$pdo = Database::getInstance();
$clinicId = 'fdebf2d7-275a-4e45-a2e0-9f7774bfb251'; // Test clinic
$doctorId = 'bd57ed52-39a3-401e-af66-653ff9fe0b60'; // Test doctor

$sStmt = $pdo->prepare("SELECT Specialtie_id FROM Doctors WHERE ID=?");
$sStmt->execute([$doctorId]);
$realSid = $sStmt->fetchColumn();
echo "Real SID: $realSid\n";

$id = $pdo->query("SELECT UUID()")->fetchColumn();

try {
    $pdo->prepare("
        INSERT INTO ClinicsDoctors (ID, Clinic_ID, Doctor_ID, specialtie_id, Status, RequestedBy)
        VALUES (?, ?, ?, ?, 'pending', 'CLINIC')
    ")->execute([$id, $clinicId, $doctorId, $realSid]);
    echo "Inserted successfully!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
