<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$db = Database::getInstance();

echo "=== ALL NON-DOCTOR USERS ===\n";
$stmt = $db->query("SELECT id, username, usertype FROM users WHERE usertype != 1");
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $u) {
    echo "id: {$u['id']} | username: {$u['username']} | usertype: {$u['usertype']}\n";
}

echo "\n=== SAMPLE DOCTOR USERS (FIRST 5) ===\n";
$stmt = $db->query("SELECT id, username, usertype FROM users WHERE usertype = 1 LIMIT 5");
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $u) {
    echo "id: {$u['id']} | username: {$u['username']} | usertype: {$u['usertype']}\n";
}

echo "\n=== SESSIONS TABLE COUNT ===\n";
$stmt = $db->query("SELECT count(*) as count FROM sessions");
echo "Sessions: " . $stmt->fetchColumn() . "\n";
