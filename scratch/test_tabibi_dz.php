<?php
require 'backend/config/database.php';
require 'backend/core/Database.php';

$pdo = Database::getInstance();
$userId = '2b780a1b-de0a-4170-9fc1-191ac174d4ad';

$stmt = $pdo->prepare("SELECT token FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
$stmt->execute([$userId]);
$token = $stmt->fetchColumn();

// Test direct call to https://tabibi.dz/api/doctor/unavailabilities
$url = "https://tabibi.dz/api/doctor/unavailabilities";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$res = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Direct https://tabibi.dz HTTP Code: $httpCode\n";
echo "Response: $res\n";
