<?php
// Test 1: Health check
echo "--- 1. Health check ---\n";
$health = file_get_contents('http://localhost:5001/api/health');
echo $health . "\n\n";

// Test 2: Auth Login
echo "--- 2. Auth Login (amar) ---\n";
$loginPayload = json_encode([
    'username' => 'amar',
    'password' => '',
    'poste' => 'Post2',
    'store' => 'Store Principale'
]);
$ch = curl_init('http://localhost:5001/api/auth/login');
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginPayload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$loginResp = curl_exec($ch);
curl_close($ch);
echo $loginResp . "\n\n";
$loginData = json_decode($loginResp, true);
$token = $loginData['data']['token'] ?? '';

// Test 3: Transactional POS Checkout
echo "--- 3. Transactional POS Checkout ---\n";
$salePayload = json_encode([
    'client' => 'khaledrandji',
    'totalHT' => 100,
    'totalTVA' => 20,
    'totalTTC' => 120,
    'paymentMethod' => 'ESPECE',
    'cashReceived' => 150,
    'changeGiven' => 30,
    'vendor' => 'amar',
    'items' => [
        [
            'id' => '10AR1253733',
            'designation' => 'KOORUI Ecran PC gaming 22 Pouces Full HD',
            'quantity' => 1,
            'price' => 100,
            'tva' => 20,
            'remise' => 0,
            'total' => 120
        ]
    ]
]);
$ch = curl_init('http://localhost:5001/api/pos/checkout');
curl_setopt($ch, CURLOPT_POSTFIELDS, $salePayload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type:application/json',
    "Authorization: Bearer $token"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$saleResp = curl_exec($ch);
curl_close($ch);
echo $saleResp . "\n\n";

// Test 4: Verify Audit Logs
echo "--- 4. Verify Audit Logs in MariaDB ---\n";
$auditResp = file_get_contents('http://localhost:5001/api/audit?limit=5');
echo $auditResp . "\n";
