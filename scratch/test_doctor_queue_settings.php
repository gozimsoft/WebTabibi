<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();

// 1. Get a test doctor
$doc = $pdo->query("SELECT id, user_id FROM doctors LIMIT 1")->fetch(PDO::FETCH_ASSOC);
if (!$doc) {
    echo "FAIL: No doctor found\n";
    exit(1);
}

$doctorId = $doc['id'];
$clinic = $pdo->query("SELECT id FROM clinics LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$clinicId = $clinic ? $clinic['id'] : $doctorId;

// Find or insert setting
$sId = $pdo->query("SELECT id FROM doctorssettingapointements WHERE doctor_id = '{$doctorId}' LIMIT 1")->fetchColumn();
require_once __DIR__ . '/../backend/helpers/UUIDHelper.php';
if (!$sId) {
    $sId = UUIDHelper::generate();
    $pdo->prepare("
        INSERT INTO doctorssettingapointements 
        (id, doctor_id, clinic_id, timescale, daytimestart, daytimeend, weekbeginday, workingdays, countdays, isregistered)
        VALUES (?, ?, ?, 15, '1899-12-30 08:30:00', '1899-12-30 17:30:00', 0, '1111110', 30, 1)
    ")->execute([$sId, $doctorId, $clinicId]);
}

// 2. Update with new queue settings
$updateStmt = $pdo->prepare("
    UPDATE doctorssettingapointements
    SET booking_mode = ?,
        shift_mode = ?,
        morning_start = ?,
        morning_end = ?,
        morning_capacity = ?,
        evening_start = ?,
        evening_end = ?,
        evening_capacity = ?,
        allow_overbooking = ?
    WHERE id = ?
");

$updateStmt->execute([
    1, // Queue-Numbers
    2, // Double Shift
    '08:30:00',
    '12:30:00',
    25,
    '14:00:00',
    '17:30:00',
    15,
    1,
    $sId
]);

// 3. Verify
$fetchStmt = $pdo->prepare("SELECT * FROM doctorssettingapointements WHERE id = ?");
$fetchStmt->execute([$sId]);
$row = $fetchStmt->fetch(PDO::FETCH_ASSOC);

assert((int)$row['booking_mode'] === 1, 'booking_mode should be 1');
assert((int)$row['shift_mode'] === 2, 'shift_mode should be 2');
assert((int)$row['morning_capacity'] === 25, 'morning_capacity should be 25');
assert((int)$row['evening_capacity'] === 15, 'evening_capacity should be 15');
assert((int)$row['allow_overbooking'] === 1, 'allow_overbooking should be 1');

echo "PASS: Doctor queue settings successfully saved and verified!\n";
