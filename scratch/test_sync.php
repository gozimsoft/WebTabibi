<?php
// scratch/test_sync.php
$baseUrl = "http://127.0.0.1/tabibi/backend";

// 1. Login
$loginData = [
    "username" => "moh",
    "password" => base64_decode("YW1hcjE5OTk=")
];

echo "Logging in as " . $loginData['username'] . "...\n";

$ch = curl_init("$baseUrl/auth/login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$resp = curl_exec($ch);
$loginRes = json_decode($resp, true);

if (!isset($loginRes['data']['token'])) {
    echo "Login failed: " . $resp . "\n";
    exit;
}

$token = $loginRes['data']['token'];
echo "Token obtained.\n\n";

// 2. Test Sync
$syncData = [
    "clinic_id" => "058A1CA1-9818-4B14-A4C0-84A327D52DA3",
    "last_sync_date" => "",
    "appointments" => [
        [
            "id" => "TEST-UUID-" . time(),
            "apointementdate" => date('Y-m-d H:i:s', strtotime('+1 day')),
            "fullname" => "Test Patient Sync",
            "phone" => "0000000000",
            "note" => "Sync Test Note",
            "status" => 0
        ]
    ]
];

echo "Calling apointements/sync...\n";

$ch = curl_init("$baseUrl/apointements/sync");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($syncData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "Authorization: Bearer $token"
]);
$resp = curl_exec($ch);
$syncRes = json_decode($resp, true);

echo "Response:\n";
echo json_encode($syncRes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
