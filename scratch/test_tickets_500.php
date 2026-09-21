<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "=== Testing all users for TicketController::list() ===\n";
$users = $pdo->query("SELECT id, username, usertype FROM users LIMIT 100")->fetchAll(PDO::FETCH_ASSOC);

foreach ($users as $u) {
    // Generate temporary session
    $token = bin2hex(random_bytes(32));
    $pdo->prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, NOW())")->execute([$token, $u['id']]);

    $ch = curl_init("http://localhost:81/api/tickets");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code !== 200) {
        echo "[ERROR] User {$u['username']} (ID: {$u['id']}, usertype: {$u['usertype']}) => HTTP $code: $res\n";
    }

    $pdo->prepare("DELETE FROM sessions WHERE token = ?")->execute([$token]);
}
echo "Done testing users.\n";
