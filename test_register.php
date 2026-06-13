<?php
$data = [
    'username' => 'testuser' . time(),
    'password' => 'password123',
    'fullname' => 'Test User',
    'email' => 'test' . time() . '@gmail.com'
];

$ch = curl_init('http://localhost:8000/auth/register');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
echo $response;
