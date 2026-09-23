<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$pdo = Database::getInstance();
$stmt = $pdo->prepare('SELECT c.clinicname, c.latitude, c.longitude, LENGTH(c.logo) as logo_len FROM clinics c JOIN users u ON u.id = c.user_id WHERE u.username = ?');
$stmt->execute(['saint_germain_e24a93']);
$res = $stmt->fetch(PDO::FETCH_ASSOC);
echo "saint_germain_e24a93:\n";
print_r($res);

$allClinics = $pdo->query('SELECT c.id, u.username, c.clinicname, c.latitude, c.longitude, LENGTH(c.logo) as logo_len FROM clinics c JOIN users u ON u.id = c.user_id')->fetchAll(PDO::FETCH_ASSOC);
echo "\nAll clinics in DB:\n";
print_r($allClinics);
