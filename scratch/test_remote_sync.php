<?php
// scratch/test_remote_sync.php
$baseUrl = "https://tabibi.dz/api";
$token = "7a9759be86ce4cc4f070bccf8cb526798c3923b67bd0fe5980781c57b4e85418";

// Try to search clinics for this doctor
echo "Searching clinics for doctor...\n";
$doctorId = "09c0c347-7ec0-48b9-ac9f-af87e7771bed";
$ch = curl_init("$baseUrl/clinics?doctor_id=$doctorId");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token"
]);
$resp = curl_exec($ch);
echo "Clinics search response: " . $resp . "\n";
$clinics = json_decode($resp, true);

$clinicId = null;
if (isset($clinics['data']['items'][0]['clinicid'])) {
    $clinicId = $clinics['data']['items'][0]['clinicid'];
}

// Try to get doctor profile to find clinic
echo "Getting doctors profile...\n";
$ch = curl_init("$baseUrl/doctors/profile");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token"
]);
$resp = curl_exec($ch);
$profile = json_decode($resp, true);

$clinicId = null;
// Look for clinics in the profile
if (isset($profile['data']['clinics'][0]['clinic_id'])) {
    $clinicId = $profile['data']['clinics'][0]['clinic_id'];
} else if (isset($profile['data']['clinic_id'])) {
    $clinicId = $profile['data']['clinic_id'];
}

if (!$clinicId) {
    echo "Could not find clinic ID. Response: " . $resp . "\n";
    // We might need to manually specify it or look elsewhere.
    // Let's try to search for the doctor's own clinics if needed.
} else {
    echo "Found Clinic ID: $clinicId\n";
}

// If we still don't have clinicId, let's try to get it from clinicsdoctors if possible?
// Actually, clinics/profile usually returns the clinic for the logged in clinic user.
// If it's a doctor user, we might need a different endpoint.

if (!$clinicId) {
   exit;
}

// Now test sync
$syncData = [
    "clinic_id" => $clinicId,
    "last_sync_date" => "",
    "appointments" => [] // Just a check for now
];

echo "Testing apointements/sync...\n";
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
