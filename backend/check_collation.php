<?php
require_once __DIR__ . '/core/Database.php';
$pdo = Database::getInstance();

foreach(['Patients', 'Doctors', 'Clinics'] as $t) {
    $stmt = $pdo->query("SHOW FULL COLUMNS FROM $t WHERE Field = 'ID'");
    print_r($stmt->fetch(PDO::FETCH_ASSOC));
}
