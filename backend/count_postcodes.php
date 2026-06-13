<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Database.php';

header("Content-Type: application/json");
$pdo = Database::getInstance();

$totalDoctors = $pdo->query("SELECT COUNT(*) FROM doctors")->fetchColumn();
$docsWithPostcode = $pdo->query("SELECT COUNT(*) FROM doctors WHERE postcode IS NOT NULL AND postcode != ''")->fetchColumn();

$totalClinics = $pdo->query("SELECT COUNT(*) FROM clinics")->fetchColumn();
$clinicsWithPostcode = $pdo->query("SELECT COUNT(*) FROM clinics WHERE postcode IS NOT NULL AND postcode != ''")->fetchColumn();

echo json_encode([
    'total_doctors' => $totalDoctors,
    'doctors_with_postcode' => $docsWithPostcode,
    'total_clinics' => $totalClinics,
    'clinics_with_postcode' => $clinicsWithPostcode
], JSON_PRETTY_PRINT);
