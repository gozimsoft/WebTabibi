<?php
// Test admin system-status endpoint
$token = null;

// 1. Get admin token from DB
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query("SELECT s.token FROM sessions s JOIN users u ON s.user_id = u.id WHERE u.usertype IN (3) ORDER BY s.id DESC LIMIT 1");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$row) { die("No admin session found\n"); }
$token = $row['token'];
echo "Token: " . substr($token, 0, 16) . "...\n";

// 2. Test /api/admin/system-status
$ch = curl_init("http://localhost:81/backend/index.php/admin/system-status");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer $token", "Accept: application/json"],
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "HTTP $code\n";
$data = json_decode($resp, true);
if ($data && isset($data['data'])) {
    echo "DB Sync Status: " . ($data['data']['db_sync']['status'] ?? 'N/A') . "\n";
    echo "DB Integrity: " . ($data['data']['db_sync']['integrity'] ?? 'N/A') . "\n";
    echo "API Status: " . ($data['data']['services']['api']['status'] ?? 'N/A') . "\n";
    echo "DB Status: " . ($data['data']['services']['database']['status'] ?? 'N/A') . "\n";
    echo "DB Latency: " . ($data['data']['services']['database']['latency_ms'] ?? 'N/A') . "ms\n";
    echo "Storage: " . ($data['data']['services']['storage']['status'] ?? 'N/A') . "\n";
    echo "Sessions: " . ($data['data']['services']['sessions']['status'] ?? 'N/A') . " (active: " . ($data['data']['services']['sessions']['active_total'] ?? '0') . ")\n";
    echo "Security: " . ($data['data']['services']['security']['status'] ?? 'N/A') . "\n";
    echo "Generated at: " . ($data['data']['generated_at'] ?? 'N/A') . "\n";
} else {
    echo "Response: $resp\n";
}

// 3. Test auth/me for admin
$ch2 = curl_init("http://localhost:81/backend/index.php/auth/me");
curl_setopt_array($ch2, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer $token", "Accept: application/json"],
]);
$resp2 = curl_exec($ch2);
$code2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
curl_close($ch2);
echo "\n=== auth/me HTTP $code2 ===\n";
$d2 = json_decode($resp2, true);
if ($d2 && isset($d2['data']['profile'])) {
    $p = $d2['data']['profile'];
    echo "last_login_at: " . ($p['last_login_at'] ?? 'NULL') . "\n";
    echo "last_login_ip: " . ($p['last_login_ip'] ?? 'NULL') . "\n";
    echo "current_session_at: " . ($p['current_session_at'] ?? 'NULL') . "\n";
    echo "current_session_ip: " . ($p['current_session_ip'] ?? 'NULL') . "\n";
    echo "prev_session_at: " . ($p['prev_session_at'] ?? 'NULL') . "\n";
    echo "prev_session_ip: " . ($p['prev_session_ip'] ?? 'NULL') . "\n";
} else {
    echo "Response: $resp2\n";
}
