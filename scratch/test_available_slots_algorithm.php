<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();

// 1. Find a clinicsdoctor row
$cd = $pdo->query("SELECT id, doctor_id, clinic_id FROM clinicsdoctors LIMIT 1")->fetch(PDO::FETCH_ASSOC);
if (!$cd) {
    echo "FAIL: No clinicsdoctors record found\n";
    exit(1);
}
$cdId = $cd['id'];
$doctorId = $cd['doctor_id'];
$clinicId = $cd['clinic_id'];

// 2. Set doctor setting to booking_mode = 1, shift_mode = 2
$sId = $pdo->query("SELECT id FROM doctorssettingapointements WHERE doctor_id = '{$doctorId}' LIMIT 1")->fetchColumn();
if (!$sId) {
    require_once __DIR__ . '/../backend/helpers/UUIDHelper.php';
    $sId = UUIDHelper::generate();
    $pdo->prepare("
        INSERT INTO doctorssettingapointements 
        (id, doctor_id, clinic_id, timescale, daytimestart, daytimeend, weekbeginday, workingdays, countdays, isregistered,
         booking_mode, shift_mode, morning_start, morning_end, morning_capacity, evening_start, evening_end, evening_capacity, allow_overbooking)
        VALUES (?, ?, ?, 15, '1899-12-30 08:30:00', '1899-12-30 17:30:00', 0, '1111111', 30, 1,
         1, 2, '08:30:00', '12:30:00', 25, '14:00:00', '17:30:00', 15, 1)
    ")->execute([$sId, $doctorId, $clinicId]);
} else {
    $pdo->prepare("
        UPDATE doctorssettingapointements
        SET booking_mode = 1, shift_mode = 2, timescale = 15, workingdays = '1111111',
            morning_start = '08:30:00', morning_end = '12:30:00', morning_capacity = 25,
            evening_start = '14:00:00', evening_end = '17:30:00', evening_capacity = 15,
            allow_overbooking = 1
        WHERE id = ?
    ")->execute([$sId]);
}

$testDate = date('Y-m-d', strtotime('+1 day'));

// Run worker in sub-process
$cmd = 'php ' . escapeshellarg(__DIR__ . '/worker_available_slots.php') . ' ' . escapeshellarg($cdId) . ' ' . escapeshellarg($testDate);
$raw = shell_exec($cmd);

$jsonPos = strpos($raw, '{"success"');
$cleanJson = substr($raw, $jsonPos);
$data = json_decode($cleanJson, true);

assert($data['success'] === true, "Response must be success");
assert($data['data']['booking_mode'] === 'queue', "booking_mode must be 'queue'");
assert(count($data['data']['shifts']) === 2, "Must return 2 shifts");

$morning = $data['data']['shifts'][0];
assert($morning['shift_type'] === 'morning', "First shift should be morning");
assert($morning['capacity'] === 25, "Morning capacity should be 25");
assert($morning['next_token'] >= 1, "next_token should be >= 1");
assert(!empty($morning['estimated_time_for_next']), "estimated_time_for_next must not be empty");

$evening = $data['data']['shifts'][1];
assert($evening['shift_type'] === 'evening', "Second shift should be evening");
assert($evening['capacity'] === 15, "Evening capacity should be 15");

echo "PASS: getAvailableSlots algorithm verified with real assertions!\n";
