<?php
require 'backend/config/database.php';
require 'backend/core/Database.php';

$pdo = Database::getInstance();
$doctorId = 'b481adaa-9da3-4893-91eb-2462510b4eb4';

// Test 1: No clinic_id
$sql1 = "
    SELECT u.*, c.clinicname
    FROM doctor_unavailabilities u
    LEFT JOIN clinics c ON c.id = u.clinic_id
    WHERE u.doctor_id = ?
    ORDER BY u.start_datetime DESC
";
$stmt1 = $pdo->prepare($sql1);
$stmt1->execute([$doctorId]);
$rows1 = $stmt1->fetchAll(PDO::FETCH_ASSOC);
echo "Test 1 (no clinic_id): Found " . count($rows1) . " rows\n";

// Test 2: With clinic_id (let's check doctor's clinic id)
$stmtC = $pdo->prepare("SELECT id FROM clinics WHERE doctor_id = ?");
$stmtC->execute([$doctorId]);
$cId = $stmtC->fetchColumn();
echo "Doctor's clinic id: " . ($cId ?: 'NONE') . "\n";

if ($cId) {
    $sql2 = "
        SELECT u.*, c.clinicname
        FROM doctor_unavailabilities u
        LEFT JOIN clinics c ON c.id = u.clinic_id
        WHERE u.doctor_id = ?
        AND (u.clinic_id = ? OR u.clinic_id IS NULL)
        ORDER BY u.start_datetime DESC
    ";
    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute([$doctorId, $cId]);
    $rows2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    echo "Test 2 (with clinic_id): Found " . count($rows2) . " rows\n";
}
