<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$docRegs = $pdo->query("SELECT id, fullname, email, doctor_id, user_id, is_frozen, status FROM doctorregistrations LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
echo "DOCTOR REGISTRATIONS:\n";
print_r($docRegs);

$clinRegs = $pdo->query("SELECT id, clinicname, email, clinic_id, user_id, is_frozen, status FROM clinicregistrations LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
echo "CLINIC REGISTRATIONS:\n";
print_r($clinRegs);
