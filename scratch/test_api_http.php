<?php
require 'backend/config/database.php';
require 'backend/core/Database.php';
require 'backend/helpers/UUIDHelper.php';

$pdo = Database::getInstance();
$userId = '2b780a1b-de0a-4170-9fc1-191ac174d4ad';

// Create a session token
$token = bin2hex(random_bytes(32));
$expiry = date('Y-m-d H:i:s', time() + 3600);
$stmt = $pdo->prepare("INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())");
$stmt->execute([UUIDHelper::generate(), $userId, $token, $expiry]);

echo "Created session token: $token\n";

// Now test GET /doctor/unavailabilities via curl to localhost:81
$url = "http://localhost:81/api/doctor/unavailabilities";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $res\n";

// Also test with clinic_id parameter:
$urlClinic = "http://localhost:81/api/doctor/unavailabilities?clinic_id=86dc18dc-6ddf-43a5-a4b2-acbd8d182cf0";
$ch2 = curl_init($urlClinic);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Content-Type: application/json"
]);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
$res2 = curl_exec($ch2);
$httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
curl_close($ch2);

echo "\nWith clinic_id HTTP Code: $httpCode2\n";
echo "Response with clinic_id: $res2\n";
