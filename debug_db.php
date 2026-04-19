<?php
require_once __DIR__ . '/backend/core/Database.php';

$pdo = Database::getInstance();

$date = '2026-04-20';
$doctorId = '...'; // I don't know the ID yet

echo "Checking appointments for $date\n";

$stmt = $pdo->prepare("SELECT ID, AppointementDate, ClinicsDoctor_id, Doctor_id, IsDelete FROM Apointements WHERE DATE(AppointementDate) = ?");
$stmt->execute([$date]);
$res = $stmt->fetchAll();

foreach($res as $r) {
    echo "ID: {$r['ID']} | Date: {$r['AppointementDate']} | CD: {$r['ClinicsDoctor_id']} | D: {$r['Doctor_id']} | Del: {$r['IsDelete']}\n";
}
