<?php
// Let's test the RelationController::respondToRequest function
// directly using the Clinic session token if available.

// No need to use session, I can just mock the AuthMiddleware.
// Let's create a script that calls the exact API endpoint.

$ch = curl_init('http://localhost:8000/api/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'username' => 'al noor', // The clinic we saw in ClinicRegistrations
    'password' => 'amar2000' // Base64 was YW1hcjIwMDA= -> amar2000
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$resp = curl_exec($ch);
$loginData = json_decode($resp, true);
$token = $loginData['data']['token'];
echo "Token: $token\n";

// Now call the respond endpoint
$reqId = 'e2dd9971-c4fd-465c-b6e1-8657d10783e6'; // Pending request
$ch2 = curl_init("http://localhost:8000/api/relations/requests/$reqId/respond");
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode(['action' => 'accept']));
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "Authorization: Bearer $token"
]);
$resp2 = curl_exec($ch2);
echo "Respond output: $resp2\n";
