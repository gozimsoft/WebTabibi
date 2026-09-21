<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$sessions = $pdo->query("SELECT s.user_id, u.username, u.usertype, s.token, s.created_at FROM sessions s JOIN users u ON u.id = s.user_id")->fetchAll(PDO::FETCH_ASSOC);
echo "Active sessions (" . count($sessions) . "):\n";
foreach ($sessions as $s) {
    echo "User: {$s['username']} (usertype: {$s['usertype']}) | Token: {$s['token']}\n";
}
