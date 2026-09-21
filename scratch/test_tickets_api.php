<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$stmt = $pdo->query('SELECT s.token, u.id, u.username, u.usertype FROM sessions s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC LIMIT 10');
while($sess = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Testing user {$sess['username']} (type: {$sess['usertype']})\n";
    $ch = curl_init('http://localhost:81/api/tickets');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$sess['token']}"]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "  -> Code: $code, Response: " . substr($res, 0, 100) . "\n";
}
