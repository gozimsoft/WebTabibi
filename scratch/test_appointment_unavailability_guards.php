<?php
// Test for Booking Guards with Doctor Unavailabilities
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/helpers/UUIDHelper.php';
require_once __DIR__ . '/../backend/controllers/AppointmentController.php';

$pdo = Database::getInstance();

echo "Running TDD test for Appointment Unavailability Guards...\n";

// 1. Get doctor
$doc = $pdo->query("
    SELECT d.id as doctor_id, cd.id as clinicsdoctor_id, cd.clinic_id
    FROM doctors d
    JOIN clinicsdoctors cd ON cd.doctor_id = d.id
    LIMIT 1
")->fetch(PDO::FETCH_ASSOC);

if (!$doc) {
    echo "FAIL: No active doctor found in database.\n";
    exit(1);
}

$doctorId = $doc['doctor_id'];
$cdId = $doc['clinicsdoctor_id'];
$clinicId = $doc['clinic_id'];
$fullDayDate = date('Y-m-d', strtotime('+4 days'));
$partialDayDate = date('Y-m-d', strtotime('+5 days'));

// Clean up previous test unavailabilities
$pdo->prepare("DELETE FROM doctor_unavailabilities WHERE doctor_id = ? AND start_datetime LIKE ?")
    ->execute([$doctorId, "$fullDayDate%"]);
$pdo->prepare("DELETE FROM doctor_unavailabilities WHERE doctor_id = ? AND start_datetime LIKE ?")
    ->execute([$doctorId, "$partialDayDate%"]);

// 2. Insert Full Day Leave
$fullLeaveId = UUIDHelper::generate();
$pdo->prepare("
    INSERT INTO doctor_unavailabilities
    (id, doctor_id, clinic_id, clinicsdoctor_id, leave_type, start_datetime, end_datetime, reason, show_reason_to_patient, created_at)
    VALUES (?, ?, ?, ?, 'full_day', ?, ?, 'عطلة رسمية للاختبار', 1, NOW())
")->execute([$fullLeaveId, $doctorId, $clinicId, $cdId, $fullDayDate . ' 00:00:00', $fullDayDate . ' 23:59:59']);

// 3. Insert Partial Hours Leave (10:00 to 12:00)
$partialLeaveId = UUIDHelper::generate();
$pdo->prepare("
    INSERT INTO doctor_unavailabilities
    (id, doctor_id, clinic_id, clinicsdoctor_id, leave_type, start_datetime, end_datetime, reason, show_reason_to_patient, created_at)
    VALUES (?, ?, ?, ?, 'partial_hours', ?, ?, 'طلعة طارئة للاختبار', 1, NOW())
")->execute([$partialLeaveId, $doctorId, $clinicId, $cdId, $partialDayDate . ' 10:00:00', $partialDayDate . ' 12:00:00']);

// 4. Test Guard helper directly
if (!method_exists('AppointmentController', 'checkUnavailabilityConflict')) {
    echo "FAIL: AppointmentController::checkUnavailabilityConflict method missing.\n";
    exit(1);
}

// Full day check
$isBlockedFull = AppointmentController::checkUnavailabilityConflict($doctorId, $clinicId, $fullDayDate . ' 11:00:00', 'full_day');
if (!$isBlockedFull) {
    echo "FAIL: Full day leave did not block booking.\n";
    exit(1);
}
echo "PASS: Full day leave successfully blocked booking.\n";

// Partial hours check
$isBlockedPartial = AppointmentController::checkUnavailabilityConflict($doctorId, $clinicId, $partialDayDate . ' 10:30:00', 'morning');
if (!$isBlockedPartial) {
    echo "FAIL: Partial hours leave did not block overlapping booking at 10:30.\n";
    exit(1);
}
echo "PASS: Partial hours leave successfully blocked overlapping booking at 10:30.\n";

$isAllowedOutside = AppointmentController::checkUnavailabilityConflict($doctorId, $clinicId, $partialDayDate . ' 14:00:00', 'evening');
if ($isAllowedOutside) {
    echo "FAIL: Booking outside partial leave was incorrectly blocked.\n";
    exit(1);
}
echo "PASS: Booking outside partial leave was allowed.\n";

// Clean up test data
$pdo->prepare("DELETE FROM doctor_unavailabilities WHERE id IN (?, ?)")
    ->execute([$fullLeaveId, $partialLeaveId]);

echo "ALL TESTS PASSED for Booking Guards with Doctor Unavailabilities!\n";
exit(0);
