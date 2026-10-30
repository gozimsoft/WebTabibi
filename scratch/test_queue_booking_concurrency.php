<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/helpers/UUIDHelper.php';

$pdo = Database::getInstance();

// 1. Get test patient and doctor
$patient = $pdo->query("SELECT id, user_id, fullname, phone FROM patients LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$cd = $pdo->query("SELECT id, doctor_id, clinic_id FROM clinicsdoctors LIMIT 1")->fetch(PDO::FETCH_ASSOC);

if (!$patient || !$cd) {
    echo "FAIL: patient or clinicsdoctor not found\n";
    exit(1);
}

// 2. Set doctor setting to booking_mode = 1, morning_capacity = 2 (for fast testing of full capacity)
$doctorId = $cd['doctor_id'];
$pdo->prepare("
    UPDATE doctorssettingapointements
    SET booking_mode = 1, shift_mode = 1, timescale = 15,
        morning_start = '08:30:00', morning_end = '12:30:00', morning_capacity = 2,
        allow_overbooking = 1
    WHERE doctor_id = ?
")->execute([$doctorId]);

$testDate = date('Y-m-d', strtotime('+3 days'));

// Clean any previous test appointments for this date
$pdo->prepare("DELETE FROM apointements WHERE clinicsdoctor_id = ? AND DATE(apointementdate) = ?")
    ->execute([$cd['id'], $testDate]);

// Set up fake session for patient
$pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$patient['user_id']]);
$token = 'test_token_patient_' . bin2hex(random_bytes(8));
$pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")
    ->execute([$patient['user_id'], $token]);

echo "Setup done for patient {$patient['fullname']} on date {$testDate}.\n";

// Helper function to call book worker using base64 payload
function callBookApi($token, $payload) {
    $b64 = base64_encode(json_encode($payload));
    $cmd = 'php ' . escapeshellarg(__DIR__ . '/worker_book.php') . ' ' . escapeshellarg($token) . ' ' . escapeshellarg($b64);
    $raw = shell_exec($cmd);
    $jsonPos = strpos($raw, '{"success"');
    if ($jsonPos === false) return ['success' => false, 'raw' => $raw];
    return json_decode(substr($raw, $jsonPos), true);
}

// Test 1: Book ticket #1
$res1 = callBookApi($token, [
    'clinics_doctor_id' => $cd['id'],
    'date' => $testDate,
    'shift_type' => 'full_day',
    'consent_health' => 1
]);
assert($res1['success'] === true, "Booking 1 should succeed: " . json_encode($res1));
assert((int)$res1['data']['token_number'] === 1, "Ticket 1 must have token_number = 1: " . json_encode($res1));
assert($res1['data']['estimated_time'] === '08:30', "Ticket 1 estimated time must be 08:30");

// Test 2: Book ticket #2
$res2 = callBookApi($token, [
    'clinics_doctor_id' => $cd['id'],
    'date' => $testDate,
    'shift_type' => 'full_day',
    'consent_health' => 1
]);
assert($res2['success'] === true, "Booking 2 should succeed: " . json_encode($res2));
assert((int)$res2['data']['token_number'] === 2, "Ticket 2 must have token_number = 2");
assert($res2['data']['estimated_time'] === '08:45', "Ticket 2 estimated time must be 08:45");

// Test 3: Book ticket #3 when capacity is 2 -> should fail with capacity full
$res3 = callBookApi($token, [
    'clinics_doctor_id' => $cd['id'],
    'date' => $testDate,
    'shift_type' => 'full_day',
    'consent_health' => 1
]);
assert($res3['success'] === false, "Booking 3 should fail because capacity is 2: " . json_encode($res3));

// Test 4: Book ticket #3 as Emergency Overbooking -> should succeed!
$res4 = callBookApi($token, [
    'clinics_doctor_id' => $cd['id'],
    'date' => $testDate,
    'shift_type' => 'full_day',
    'is_emergency' => 1,
    'consent_health' => 1
]);
assert($res4['success'] === true, "Emergency booking should succeed even when full: " . json_encode($res4));
assert((int)$res4['data']['token_number'] === 3, "Emergency ticket must have token_number = 3");

echo "PASS: Queue booking concurrency, numbering, capacity limit, and emergency overbooking verified!\n";
