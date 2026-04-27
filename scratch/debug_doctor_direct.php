<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/core/Response.php';

$id = '30ED4658-AACE-4B5F-8EB7-D18EC9DE481C';
$pdo = Database::getInstance();

$stmt = $pdo->prepare("
    SELECT 
        d.*, 
        d.cnas as Cnas, d.casnos as Casnos,
        d.education as Education, d.presentation as Presentation,
        d.payementmethods as PayementMethods,
        s.namefr as specialtyfr, s.namear as specialtyar,
        b.namefr as BaladiyaName,
        COALESCE(AVG(dr2.rating),0) as AvgRating,
        COUNT(DISTINCT dr2.id) as RatingCount
    FROM doctors d
    LEFT JOIN specialties s ON s.id = d.specialtie_id
    LEFT JOIN baladiyas b  ON b.id = d.baladiya_id
    LEFT JOIN doctorsratings dr2 ON dr2.doctor_id = d.id
    WHERE d.id = ? AND (UPPER(d.status) = 'APPROVED')
    GROUP BY d.id
");
$stmt->execute([$id]);
$doctor = $stmt->fetch();

if (!$doctor) {
    echo "RESULT: Doctor NOT FOUND\n";
    // Check why
    $s2 = $pdo->prepare("SELECT id, status FROM doctors WHERE id = ?");
    $s2->execute([$id]);
    $raw = $s2->fetch();
    echo "RAW: "; print_r($raw);
} else {
    echo "RESULT: Doctor FOUND - " . $doctor['fullname'] . "\n";
    // Test reasons
    $stmt2 = $pdo->prepare("SELECT id, namear as reason_name_ar, namefr as reason_name, time as reason_time, color as reason_color FROM reasons WHERE doctor_id = ?");
    $stmt2->execute([$id]);
    echo "REASONS: " . count($stmt2->fetchAll()) . "\n";
}
