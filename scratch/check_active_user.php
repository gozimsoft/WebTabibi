<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "=== TOP SESSIONS ===\n";
$stmt = $pdo->query('
    SELECT s.token, s.created_at, u.id, u.username, u.usertype 
    FROM sessions s 
    JOIN users u ON u.id = s.user_id 
    ORDER BY s.created_at DESC 
    LIMIT 10
');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "User: {$r['username']} (ID: {$r['id']}, usertype: {$r['usertype']}), Token: " . substr($r['token'], 0, 15) . "... Created: {$r['created_at']}\n";
}

echo "\n=== DOCTORS ===\n";
$stmt = $pdo->query('SELECT d.id, d.user_id, d.fullname, d.is_frozen, u.username, u.usertype FROM doctors d JOIN users u ON u.id = d.user_id');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Doctor: {$r['fullname']} (DocID: {$r['id']}, UserID: {$r['user_id']}, Username: {$r['username']}, usertype: {$r['usertype']}, Frozen: {$r['is_frozen']})\n";
}

echo "\n=== CLINICS ===\n";
$stmt = $pdo->query('SELECT c.id, c.user_id, c.clinicname, c.is_frozen, u.username, u.usertype FROM clinics c JOIN users u ON u.id = c.user_id');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Clinic: {$r['clinicname']} (ClinicID: {$r['id']}, UserID: {$r['user_id']}, Username: {$r['username']}, usertype: {$r['usertype']}, Frozen: {$r['is_frozen']})\n";
}
