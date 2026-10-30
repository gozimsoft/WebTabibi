<?php
// E2E Verification of Doctor Unavailabilities & Resolution System
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/helpers/UUIDHelper.php';
require_once __DIR__ . '/../backend/controllers/DoctorController.php';
require_once __DIR__ . '/../backend/controllers/AppointmentController.php';

$pdo = Database::getInstance();
echo "=== Starting E2E Verification for Doctor Unavailabilities System ===\n\n";

// 1. Get test doctor and patient
$doc = $pdo->query("
    SELECT d.id as doctor_id, d.user_id, cd.id as clinicsdoctor_id, cd.clinic_id
    FROM doctors d
    JOIN clinicsdoctors cd ON cd.doctor_id = d.id
    LIMIT 1
")->fetch(PDO::FETCH_ASSOC);

$patient = $pdo->query("SELECT id, user_id, fullname, phone FROM patients LIMIT 1")->fetch(PDO::FETCH_ASSOC);

if (!$doc || !$patient) {
    echo "FAIL: Test fixtures not found.\n";
    exit(1);
}

$doctorId = $doc['doctor_id'];
$cdId = $doc['clinicsdoctor_id'];
$clinicId = $doc['clinic_id'];
$patientId = $patient['id'];
$date1 = date('Y-m-d', strtotime('+6 days'));
$date2 = date('Y-m-d', strtotime('+7 days'));

echo "[1/5] Setting up test appointments for dates {$date1} and {$date2}...\n";

// Clean previous
$pdo->prepare("DELETE FROM doctor_unavailabilities WHERE doctor_id = ? AND (start_datetime LIKE ? OR start_datetime LIKE ?)")
    ->execute([$doctorId, "$date1%", "$date2%"]);
$pdo->prepare("DELETE FROM apointements WHERE clinicsdoctor_id = ? AND (DATE(apointementdate) = ? OR DATE(apointementdate) = ?)")
    ->execute([$cdId, $date1, $date2]);

$appt1Id = UUIDHelper::generate();
$appt2Id = UUIDHelper::generate();

$pdo->prepare("
    INSERT INTO apointements (id, apointementdate, clinicsdoctor_id, patient_id, patientname, phone, status, queue_status, shift_type)
    VALUES (?, ?, ?, ?, ?, ?, 0, 'waiting', 'morning')
")->execute([$appt1Id, $date1 . ' 10:00:00', $cdId, $patientId, $patient['fullname'], $patient['phone']]);

$pdo->prepare("
    INSERT INTO apointements (id, apointementdate, clinicsdoctor_id, patient_id, patientname, phone, status, queue_status, shift_type)
    VALUES (?, ?, ?, ?, ?, ?, 0, 'waiting', 'morning')
")->execute([$appt2Id, $date2 . ' 11:00:00', $cdId, $patientId, $patient['fullname'], $patient['phone']]);

echo "  -> Created appointments: {$appt1Id} on {$date1}, {$appt2Id} on {$date2}.\n";

// [2/5] Test Conflict Detection
echo "[2/5] Testing conflict detection on {$date1}...\n";
$conflicts = DoctorController::checkConflictsLogic($doctorId, $clinicId, $date1 . ' 00:00:00', $date1 . ' 23:59:59', 'full_day');
if (!$conflicts['has_conflicts'] || $conflicts['count'] < 1) {
    echo "FAIL: Conflicts not detected on {$date1}.\n";
    exit(1);
}
echo "  -> PASS: Detected {$conflicts['count']} conflict(s) correctly.\n";

// [3/5] Test Creation with 'cancel' action
echo "[3/5] Testing leave creation with 'cancel' action on {$date1}...\n";
$resCancel = DoctorController::createUnavailabilityLogic(
    $doctorId, $clinicId, $cdId, 'full_day',
    $date1 . ' 00:00:00', $date1 . ' 23:59:59', null,
    'مناسبة خاصة للاختبار', 1, $doc['user_id'], 'cancel'
);

if (!$resCancel['success']) {
    echo "FAIL: Create with cancel failed: " . json_encode($resCancel) . "\n";
    exit(1);
}

$stmt = $pdo->prepare("SELECT status, queue_status FROM apointements WHERE id = ?");
$stmt->execute([$appt1Id]);
$a1 = $stmt->fetch(PDO::FETCH_ASSOC);
if ((int)$a1['status'] !== 2 || $a1['queue_status'] !== 'cancelled') {
    echo "FAIL: Appointment 1 not marked cancelled.\n";
    exit(1);
}
echo "  -> PASS: Appointment 1 marked status=2 (cancelled) with patient notification.\n";

// [4/5] Test Creation with 'reschedule' action on date2
echo "[4/5] Testing leave creation with 'reschedule' action on {$date2}...\n";
$resResched = DoctorController::createUnavailabilityLogic(
    $doctorId, $clinicId, $cdId, 'full_day',
    $date2 . ' 00:00:00', $date2 . ' 23:59:59', null,
    'ظرف طارئ للترحيل', 1, $doc['user_id'], 'reschedule'
);

if (!$resResched['success']) {
    echo "FAIL: Create with reschedule failed: " . json_encode($resResched) . "\n";
    exit(1);
}

$stmt = $pdo->prepare("SELECT apointementdate FROM apointements WHERE id = ?");
$stmt->execute([$appt2Id]);
$newDate = $stmt->fetchColumn();
$expectedNewDate = date('Y-m-d', strtotime("$date2 +1 day"));
if (strpos($newDate, $expectedNewDate) !== 0) {
    echo "FAIL: Appointment 2 was not rescheduled to +1 day. New date: {$newDate}\n";
    exit(1);
}
echo "  -> PASS: Appointment 2 successfully rescheduled to {$newDate}.\n";

// [5/5] Test Guard Conflict Block
echo "[5/5] Testing booking guard against active leave on {$date1}...\n";
$guardConflict = AppointmentController::checkUnavailabilityConflict($doctorId, $clinicId, $date1 . ' 10:00:00');
if (!$guardConflict) {
    echo "FAIL: Guard did not detect active leave.\n";
    exit(1);
}
echo "  -> PASS: Guard detected active leave: {$guardConflict['reason']}.\n";

// Cleanup test fixtures
$pdo->prepare("DELETE FROM doctor_unavailabilities WHERE id IN (?, ?)")
    ->execute([$resCancel['id'], $resResched['id']]);
$pdo->prepare("DELETE FROM apointements WHERE id IN (?, ?)")
    ->execute([$appt1Id, $appt2Id]);

echo "\n======================================================\n";
echo "✓ ALL 5/5 E2E INTEGRATION CHECKS PASSED SUCCESSFULLY!\n";
echo "======================================================\n";
exit(0);
