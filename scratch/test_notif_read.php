<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/helpers/UUIDHelper.php';

$pdo = Database::getInstance();

// Get an admin user
$user = $pdo->query("SELECT id, username FROM users WHERE usertype = 3 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    echo "No admin user found\n";
    exit(1);
}

// Get or create session
$stmt = $pdo->prepare("SELECT token FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
$stmt->execute([$user['id']]);
$token = $stmt->fetchColumn();
if (!$token) {
    $token = bin2hex(random_bytes(32));
    $pdo->prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, NOW())")
        ->execute([$token, $user['id']]);
}

// Insert a test notification for this user
$notifId = UUIDHelper::generate();
$pdo->prepare("INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES (?, ?, 'Test Notif', 'Test Message', 'admin_ticket', 0, NOW())")
    ->execute([$notifId, $user['id']]);

echo "Created test notification: $notifId\n";

// Test PUT /api/notifications/:id/read
$ch = curl_init("http://localhost:8000/api/notifications/$notifId/read");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => 'PUT',
    CURLOPT_HTTPHEADER     => [
        "Authorization: Bearer $token",
        "Content-Type: application/json"
    ]
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "PUT /api/notifications/$notifId/read -> HTTP $code: $resp\n";

// Verify it is read in DB
$isRead = $pdo->query("SELECT is_read FROM notifications WHERE id = '$notifId'")->fetchColumn();
echo "Notification is_read in DB: $isRead\n";

// Clean up
$pdo->prepare("DELETE FROM notifications WHERE id = ?")->execute([$notifId]);
echo "Test notification cleaned up.\n";
