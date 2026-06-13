<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Database.php';

header("Content-Type: application/json");
$pdo = Database::getInstance();

$doctors = $pdo->query("SELECT fullname, postcode, baladiya_id FROM doctors LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
$clinics = $pdo->query("SELECT clinicname, postcode FROM clinics LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'doctors' => $doctors,
    'clinics' => $clinics
], JSON_PRETTY_PRINT);
