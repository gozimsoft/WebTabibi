<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "=== SESSIONS ===\n";
$stmt = $pdo->query('
    SELECT s.token, s.created_at, u.id, u.username, u.usertype 
    FROM sessions s 
    JOIN users u ON u.id = s.user_id 
    ORDER BY s.created_at DESC 
    LIMIT 10
');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "User: {$r['username']} (ID: {$r['id']}, usertype: {$r['usertype']}), Token: " . substr($r['token'], 0, 10) . "..., Created: {$r['created_at']}\n";
}

echo "\n=== DOCTORS ===\n";
$stmt = $pdo->query('SELECT d.id, d.user_id, d.fullname, d.is_frozen, u.username FROM doctors d JOIN users u ON u.id = d.user_id');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Doctor: {$r['fullname']} (DocID: {$r['id']}, UserID: {$r['user_id']}, Username: {$r['username']}, Frozen: {$r['is_frozen']})\n";
}

echo "\n=== CLINIC 6789f1a5-df59-47d6-a5c8-8b363bd1e13e ===\n";
$stmt = $pdo->prepare('SELECT * FROM clinics WHERE id = ?');
$stmt->execute(['6789f1a5-df59-47d6-a5c8-8b363bd1e13e']);
$clinic = $stmt->fetch(PDO::FETCH_ASSOC);
print_r($clinic);

echo "\n=== CLINICSDOCTORS for this clinic ===\n";
$stmt = $pdo->prepare('SELECT * FROM clinicsdoctors WHERE clinic_id = ?');
$stmt->execute(['6789f1a5-df59-47d6-a5c8-8b363bd1e13e']);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
