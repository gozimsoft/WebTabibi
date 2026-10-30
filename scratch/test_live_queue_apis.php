<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/helpers/UUIDHelper.php';

$pdo = Database::getInstance();

// 1. Get test clinicsdoctor joined with doctor
$row = $pdo->query("
    SELECT cd.id as cd_id, cd.doctor_id, cd.clinic_id, d.user_id, d.fullname
    FROM clinicsdoctors cd
    JOIN doctors d ON d.id = cd.doctor_id
    LIMIT 1
")->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo "FAIL: Doctor or clinicsdoctor not found\n";
    exit(1);
}

$cdId = $row['cd_id'];
$doctorId = $row['doctor_id'];
$userId = $row['user_id'];

// Ensure session for doctor
$pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$userId]);
$docToken = 'test_token_doc_live_' . bin2hex(random_bytes(8));
$pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")
    ->execute([$userId, $docToken]);

$today = date('Y-m-d');

// Clean any previous test appointments for today with token 10/11
$pdo->prepare("DELETE FROM apointements WHERE clinicsdoctor_id = ? AND token_number IN (10, 11)")
    ->execute([$cdId]);

// Create two test appointments for today with token 10 and 11
$appt1Id = UUIDHelper::generate();
$appt2Id = UUIDHelper::generate();

$pdo->prepare("
    INSERT INTO apointements 
    (id, clinicsdoctor_id, apointementdate, patientname, phone, status, token_number, shift_type, estimated_time, queue_status, updatedat)
    VALUES 
    (?, ?, '{$today} 10:00:00', 'مريض تجريبي أول', '0555111222', 0, 10, 'morning', '10:00:00', 'waiting', NOW()),
    (?, ?, '{$today} 10:15:00', 'مريض تجريبي ثان', '0555333444', 0, 11, 'morning', '10:15:00', 'waiting', NOW())
")->execute([$appt1Id, $cdId, $appt2Id, $cdId]);

echo "Created test appointments {$appt1Id} (#10) and {$appt2Id} (#11).\n";

// Helper to call worker
function callApi($method, $action, $token, $param1 = null, $body = null) {
    $b64 = base64_encode(json_encode($body ?? []));
    $cmd = 'php ' . escapeshellarg(__DIR__ . '/worker_queue_api.php') . ' ' . escapeshellarg($method) . ' ' . escapeshellarg($action) . ' ' . escapeshellarg($token) . ' ' . escapeshellarg($param1 ?? '') . ' ' . escapeshellarg($b64);
    $raw = shell_exec($cmd);
    $jsonPos = strpos($raw, '{"success"');
    if ($jsonPos === false) return ['success' => false, 'raw' => $raw];
    return json_decode(substr($raw, $jsonPos), true);
}

// Test 1: update queue status of appt1 to in_consultation
$res1 = callApi('PUT', 'updateQueueStatus', $docToken, $appt1Id, ['queue_status' => 'in_consultation']);
assert($res1['success'] === true, "updateQueueStatus should succeed: " . json_encode($res1));

// Verify DB
$check1 = $pdo->query("SELECT queue_status FROM apointements WHERE id = '{$appt1Id}'")->fetchColumn();
assert($check1 === 'in_consultation', "DB queue_status should be in_consultation");

// Test 2: getLiveQueueStatus
$res2 = callApi('GET', 'getLiveQueueStatus', $docToken, null, ['clinics_doctor_id' => $cdId, 'date' => $today]);
assert($res2['success'] === true, "getLiveQueueStatus should succeed: " . json_encode($res2));
assert((int)$res2['data']['current_serving']['token_number'] === 10, "current_serving token should be 10: " . json_encode($res2));
assert((int)$res2['data']['next_waiting']['token_number'] === 11, "next_waiting token should be 11: " . json_encode($res2));

// Test 3: update appt1 to completed
$res3 = callApi('PUT', 'updateQueueStatus', $docToken, $appt1Id, ['queue_status' => 'completed']);
assert($res3['success'] === true, "Marking completed should succeed");

echo "PASS: Live queue management and TV display status APIs verified!\n";
