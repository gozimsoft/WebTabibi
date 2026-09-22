<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$t = $pdo->query("SELECT id, patient_id, doctor_id FROM tickets WHERE patient_id IS NOT NULL AND doctor_id IS NOT NULL LIMIT 1")->fetch(PDO::FETCH_ASSOC);
if (!$t) {
    echo "No ticket found\n";
    exit(0);
}

// 1. Test Patient A vs Patient B
$otherP = $pdo->prepare("SELECT u.id, u.username FROM users u JOIN patients p ON p.user_id = u.id WHERE p.id != ? AND u.usertype = 0 LIMIT 1");
$otherP->execute([$t['patient_id']]);
$otherPatientUser = $otherP->fetch(PDO::FETCH_ASSOC);

if ($otherPatientUser) {
    $tokenP = 'audit_p_' . bin2hex(random_bytes(8));
    $pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")->execute([$otherPatientUser['id'], $tokenP]);
    
    $ch = curl_init("http://localhost/tabibi/backend/tickets/" . $t['id']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $tokenP", "Accept: application/json"]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $pdo->prepare("DELETE FROM sessions WHERE token = ?")->execute([$tokenP]);
    echo "Patient A trying to access Patient B ticket: HTTP $code (Expected 403)\n";
    $d = json_decode($res, true);
    echo "  Message: " . ($d['message'] ?? 'N/A') . "\n";
} else {
    echo "Single patient in DB\n";
}

// 2. Test Doctor A vs Doctor B
$otherD = $pdo->prepare("SELECT u.id, u.username FROM users u JOIN doctors d ON d.user_id = u.id WHERE d.id != ? AND u.usertype = 1 LIMIT 1");
$otherD->execute([$t['doctor_id']]);
$otherDoctorUser = $otherD->fetch(PDO::FETCH_ASSOC);

if ($otherDoctorUser) {
    $tokenD = 'audit_d_' . bin2hex(random_bytes(8));
    $pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")->execute([$otherDoctorUser['id'], $tokenD]);
    
    $ch = curl_init("http://localhost/tabibi/backend/tickets/" . $t['id']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $tokenD", "Accept: application/json"]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $pdo->prepare("DELETE FROM sessions WHERE token = ?")->execute([$tokenD]);
    echo "Doctor A trying to access Doctor B ticket: HTTP $code (Expected 403)\n";
    $d = json_decode($res, true);
    echo "  Message: " . ($d['message'] ?? 'N/A') . "\n";
} else {
    echo "Single doctor in DB\n";
}
