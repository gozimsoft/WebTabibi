<?php
require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/helpers/UUIDHelper.php';

$pdo = Database::getInstance();

// 1. Test Patient
$patientUsername = 'test_patient';
$patientEmail = 'test_patient@tabibi.dz';
$patientPassword = 'password123';
$passwordHash = password_hash($patientPassword, PASSWORD_DEFAULT);

// Check if user exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$patientUsername]);
$patientUserId = $stmt->fetchColumn();

if (!$patientUserId) {
    $patientUserId = UUIDHelper::generate();
    $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, ?, ?, 0)")
        ->execute([$patientUserId, $patientUsername, $passwordHash]);
    echo "Created user test_patient ($patientUserId)\n";
} else {
    $pdo->prepare("UPDATE users SET password = ?, usertype = 0 WHERE id = ?")
        ->execute([$passwordHash, $patientUserId]);
    echo "Updated user test_patient password ($patientUserId)\n";
}

// Ensure patient profile exists
$pStmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ?");
$pStmt->execute([$patientUserId]);
$patientId = $pStmt->fetchColumn();

if (!$patientId) {
    $patientId = UUIDHelper::generate();
    $pdo->prepare("INSERT INTO patients (id, user_id, fullname, phone, email, deleteacount, emailvalidation, phonevalidation)
                   VALUES (?, ?, 'Patient Test', '0555123456', ?, 0, 1, 1)")
        ->execute([$patientId, $patientUserId, $patientEmail]);
    echo "Created patient profile ($patientId)\n";
} else {
    $pdo->prepare("UPDATE patients SET fullname = 'Patient Test', deleteacount = 0, emailvalidation = 1, phonevalidation = 1 WHERE id = ?")
        ->execute([$patientId]);
    echo "Updated patient profile ($patientId)\n";
}

// 2. Test Doctor
$doctorUsername = 'test_doctor';
$doctorEmail = 'test_doctor@tabibi.dz';
$doctorPassword = 'password123';

// Get a valid specialty ID
$specStmt = $pdo->query("SELECT id FROM specialties LIMIT 1");
$specialtyId = $specStmt->fetchColumn() ?: null;

$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$doctorUsername]);
$doctorUserId = $stmt->fetchColumn();

if (!$doctorUserId) {
    $doctorUserId = UUIDHelper::generate();
    $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, ?, ?, 1)")
        ->execute([$doctorUserId, $doctorUsername, $passwordHash]);
    echo "Created user test_doctor ($doctorUserId)\n";
} else {
    $pdo->prepare("UPDATE users SET password = ?, usertype = 1 WHERE id = ?")
        ->execute([$passwordHash, $doctorUserId]);
    echo "Updated user test_doctor password ($doctorUserId)\n";
}

// Ensure doctor profile exists
$dStmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ?");
$dStmt->execute([$doctorUserId]);
$doctorId = $dStmt->fetchColumn();

if (!$doctorId) {
    $doctorId = UUIDHelper::generate();
    $pdo->prepare("INSERT INTO doctors (id, user_id, fullname, phone, email, specialtie_id, status, emailvalidation, phonevalidation)
                   VALUES (?, ?, 'Dr. Test Doctor', '0555654321', ?, ?, 'APPROVED', 1, 1)")
        ->execute([$doctorId, $doctorUserId, $doctorEmail, $specialtyId]);
    echo "Created doctor profile ($doctorId)\n";
} else {
    $pdo->prepare("UPDATE doctors SET fullname = 'Dr. Test Doctor', status = 'APPROVED', emailvalidation = 1, phonevalidation = 1 WHERE id = ?")
        ->execute([$doctorId]);
    echo "Updated doctor profile ($doctorId)\n";
}

echo "\n============================================\n";
echo " TEST ACCOUNTS CREATED / UPDATED SUCCESSFULLY\n";
echo "============================================\n";
echo "Patient Account:\n";
echo "  Username: test_patient\n";
echo "  Password: password123\n";
echo "  Role: Patient (usertype 0)\n";
echo "  Fullname: Patient Test\n";
echo "--------------------------------------------\n";
echo "Doctor Account:\n";
echo "  Username: test_doctor\n";
echo "  Password: password123\n";
echo "  Role: Doctor (usertype 1)\n";
echo "  Fullname: Dr. Test Doctor\n";
echo "============================================\n";
