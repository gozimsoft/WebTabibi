<?php
require 'core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query('SELECT ID, User_id FROM Doctors LIMIT 2');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

$stmt2 = $pdo->query('SELECT ID, Clinic_ID, Doctor_ID FROM ClinicsDoctors LIMIT 2');
print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
