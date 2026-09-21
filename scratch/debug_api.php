<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$pdo = Database::getInstance();
$u = $pdo->query("SELECT id FROM users WHERE usertype = 3 LIMIT 1")->fetch();
$token = bin2hex(random_bytes(32));
$pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")->execute([$u['id'], $token]);

$ch = curl_init('http://localhost:8000/superadmin/accounts');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $token]);
$res = curl_exec($ch);
echo "RESPONSE:\n" . $res . "\n";
curl_close($ch);

$pdo->prepare("DELETE FROM sessions WHERE token = ?")->execute([$token]);
