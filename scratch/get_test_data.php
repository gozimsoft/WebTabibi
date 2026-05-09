<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$d = $pdo->query('SELECT u.username, u.password, d.id as doctor_id FROM users u JOIN doctors d ON d.user_id = u.id LIMIT 1')->fetch(PDO::FETCH_ASSOC);
if (!$d) {
    echo "No doctor found\n";
    exit;
}
// Find a clinic linked to this doctor
$stmt = $pdo->prepare("SELECT clinic_id FROM clinicsdoctors WHERE doctor_id = ? LIMIT 1");
$stmt->execute([$d['doctor_id']]);
$c = $stmt->fetch(PDO::FETCH_ASSOC);
$d['clinic_id'] = $c['clinic_id'] ?? null;

echo json_encode($d);
