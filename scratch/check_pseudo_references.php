<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$pseudoIds = $pdo->query("SELECT id, num, namefr FROM wilayas WHERE num > 58")->fetchAll(PDO::FETCH_ASSOC);

echo "Checking references to pseudo-wilayas (num > 58):\n";
foreach ($pseudoIds as $pw) {
    $id = $pw['id'];
    $num = $pw['num'];
    $name = $pw['namefr'];
    
    // Check baladiyas
    $bCount = $pdo->query("SELECT COUNT(*) FROM baladiyas WHERE wilaya_id = '$id'")->fetchColumn();
    // Check clinics
    $cCount = $pdo->query("SELECT COUNT(*) FROM clinics WHERE wilaya_id = '$id'")->fetchColumn();
    // Check patients
    $pCount = $pdo->query("SELECT COUNT(*) FROM patients WHERE wilaya_id = '$id'")->fetchColumn();
    // Check doctorregistrations
    $drCount = $pdo->query("SELECT COUNT(*) FROM doctorregistrations WHERE wilaya_id = '$id'")->fetchColumn();
    // Check clinicregistrations
    $crCount = $pdo->query("SELECT COUNT(*) FROM clinicregistrations WHERE wilaya_id = '$id'")->fetchColumn();
    
    echo sprintf("[%2d] %-20s: baladiyas=%d, clinics=%d, patients=%d, docReg=%d, clnReg=%d\n", 
        $num, $name, $bCount, $cCount, $pCount, $drCount, $crCount);
}
