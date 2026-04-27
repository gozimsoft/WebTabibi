<?php
$url = 'http://localhost:8000/api/doctors/30ED4658-AACE-4B5F-8EB7-D18EC9DE481C';
$resp = file_get_contents($url);
if ($resp === false) {
    echo "ERROR: Could not connect to $url\n";
} else {
    echo "STATUS: OK\n";
    $data = json_decode($resp, true);
    echo "SUCCESS: " . ($data['success'] ?? 'n/a') . "\n";
    if (isset($data['message'])) echo "MESSAGE: " . $data['message'] . "\n";
    if (isset($data['data'])) {
        echo "DOCTOR ID: " . ($data['data']['id'] ?? 'missing') . "\n";
        echo "FULLNAME: " . ($data['data']['fullname'] ?? 'missing') . "\n";
        echo "REASONS COUNT: " . count($data['data']['reasons'] ?? []) . "\n";
        echo "CLINICS COUNT: " . count($data['data']['OtherClinics'] ?? []) . "\n";
    }
}
