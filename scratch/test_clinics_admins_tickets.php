<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/controllers/TicketController.php';

$pdo = Database::getInstance();

// Test the 3 clinics
$clinics = $pdo->query("SELECT c.id, c.user_id, u.username, u.usertype FROM clinics c JOIN users u ON u.id = c.user_id")->fetchAll(PDO::FETCH_ASSOC);
foreach ($clinics as $c) {
    echo "Testing clinic {$c['clinicname']} ({$c['username']}): ";
    $token = bin2hex(random_bytes(32));
    $pdo->prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, NOW())")->execute([$token, $c['user_id']]);
    
    $ch = curl_init("http://localhost:81/api/tickets");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "HTTP $code => $res\n";
    $pdo->prepare("DELETE FROM sessions WHERE token = ?")->execute([$token]);
}

// Test admin
$admins = $pdo->query("SELECT id, username, usertype FROM users WHERE usertype IN (3, 4)")->fetchAll(PDO::FETCH_ASSOC);
foreach ($admins as $a) {
    echo "Testing admin {$a['username']}: ";
    $token = bin2hex(random_bytes(32));
    $pdo->prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, NOW())")->execute([$token, $a['id']]);
    
    $ch = curl_init("http://localhost:81/api/tickets");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "HTTP $code => $res\n";
    $pdo->prepare("DELETE FROM sessions WHERE token = ?")->execute([$token]);
}
