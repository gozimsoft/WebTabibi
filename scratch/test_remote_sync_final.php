<?php
// scratch/test_remote_sync_final.php
$baseUrl = "https://tabibi.dz/api";
$token = "7a9759be86ce4cc4f070bccf8cb526798c3923b67bd0fe5980781c57b4e85418";
$clinicId = "058A1CA1-9818-4B14-A4C0-84A327D52DA3"; // Using the clinic ID I found earlier in local

echo "Testing apointements/sync on remote host...\n";

$syncData = [
    "clinic_id" => $clinicId,
    "last_sync_date" => "",
    "appointments" => []
];

$ch = curl_init("$baseUrl/apointements/sync");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($syncData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer $token"
]);
$resp = curl_exec($ch);
echo "Response:\n";
echo $resp . "\n";
