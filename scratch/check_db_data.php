<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

try {
    $pdo = Database::getInstance();
    
    echo "=== CLINICS DATA ===\n";
    $stmt = $pdo->query("SELECT id, clinicname, email, phone, latitude, longitude, CASE WHEN logo IS NOT NULL THEN LENGTH(logo) ELSE 0 END as logo_len FROM clinics LIMIT 10");
    $clinics = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($clinics as $c) {
        echo "- Clinic: {$c['clinicname']} | Lat: " . var_export($c['latitude'], true) . " | Lng: " . var_export($c['longitude'], true) . " | Logo Bytes: {$c['logo_len']}\n";
    }

    echo "\n=== DOCTORS DATA ===\n";
    $stmt = $pdo->query("SELECT id, fullname, email, phone, CASE WHEN photoprofile IS NOT NULL THEN LENGTH(photoprofile) ELSE 0 END as photo_len FROM doctors LIMIT 10");
    $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($doctors as $d) {
        echo "- Doctor: {$d['fullname']} | Photo Bytes: {$d['photo_len']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
