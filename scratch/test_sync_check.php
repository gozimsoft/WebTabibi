<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$clinicId = '6789f1a5-df59-47d6-a5c8-8b363bd1e13e';
$stmt = $pdo->query('SELECT s.token, u.id, u.username, u.usertype FROM sessions s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC LIMIT 10');
while($sess = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Testing user {$sess['username']} (type: {$sess['usertype']}):\n";
    
    // Test sync-check
    $ch = curl_init("http://localhost:81/api/appointments/sync-check?clinic_id=$clinicId");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$sess['token']}"]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "   sync-check: Code $code -> $res\n";

    // Test manager
    $ch = curl_init("http://localhost:81/api/appointments/manager?clinic_id=$clinicId");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$sess['token']}"]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "   manager: Code $code -> " . substr($res, 0, 100) . "\n";
}
