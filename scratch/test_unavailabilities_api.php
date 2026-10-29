<?php
// Test for Doctor Unavailabilities & Conflict Resolution API
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/helpers/UUIDHelper.php';
require_once __DIR__ . '/../backend/controllers/DoctorController.php';

$pdo = Database::getInstance();

echo "Running TDD test for Doctor Unavailabilities API...\n";

// 1. Find an existing active doctor
$doc = $pdo->query("
    SELECT d.id as doctor_id, d.user_id, cd.id as clinicsdoctor_id, cd.clinic_id
    FROM doctors d
    JOIN clinicsdoctors cd ON cd.doctor_id = d.id
    LIMIT 1
")->fetch(PDO::FETCH_ASSOC);

if (!$doc) {
    echo "FAIL: No active doctor found in database for test.\n";
    exit(1);
}

// 2. Find a patient
$patient = $pdo->query("SELECT id, user_id, fullname, phone FROM patients LIMIT 1")->fetch(PDO::FETCH_ASSOC);
if (!$patient) {
    echo "FAIL: No patient found in database for test.\n";
    exit(1);
}

$doctorId = $doc['doctor_id'];
$cdId = $doc['clinicsdoctor_id'];
$clinicId = $doc['clinic_id'];
$patientId = $patient['id'];
$testDate = date('Y-m-d', strtotime('+3 days'));
$testDatetime = $testDate . ' 10:00:00';

// Clean any previous test data for this date
$pdo->prepare("DELETE FROM doctor_unavailabilities WHERE doctor_id = ? AND start_datetime LIKE ?")
    ->execute([$doctorId, "$testDate%"]);
$pdo->prepare("DELETE FROM apointements WHERE clinicsdoctor_id = ? AND DATE(apointementdate) = ?")
    ->execute([$cdId, $testDate]);

// Insert a test appointment on testDate
$apptId = UUIDHelper::generate();
$pdo->prepare("
    INSERT INTO apointements (id, apointementdate, clinicsdoctor_id, patient_id, patientname, phone, status, queue_status, shift_type)
    VALUES (?, ?, ?, ?, ?, ?, 0, 'waiting', 'morning')
")->execute([$apptId, $testDatetime, $cdId, $patientId, $patient['fullname'], $patient['phone']]);

echo "Created test appointment {$apptId} on {$testDatetime}.\n";

// Verify methods exist on DoctorController
if (!method_exists('DoctorController', 'checkConflictsLogic')) {
    echo "FAIL: DoctorController::checkConflictsLogic does not exist.\n";
    exit(1);
}

// Test check conflicts logic
$conflicts = DoctorController::checkConflictsLogic($doctorId, $clinicId, $testDate . ' 08:00:00', $testDate . ' 12:00:00', 'partial_hours', 'morning');
if (empty($conflicts['has_conflicts']) || $conflicts['count'] < 1) {
    echo "FAIL: Expected conflicts for test appointment, got " . json_encode($conflicts) . "\n";
    exit(1);
}
echo "PASS: checkConflictsLogic correctly detected " . $conflicts['count'] . " conflict(s).\n";

// Test create leave with 'cancel' action
$unavailId = UUIDHelper::generate();
$createRes = DoctorController::createUnavailabilityLogic(
    $doctorId,
    $clinicId,
    $cdId,
    'partial_hours',
    $testDate . ' 08:00:00',
    $testDate . ' 12:00:00',
    'morning',
    'ظرف طارئ للاختبار',
    1,
    $doc['user_id'],
    'cancel'
);

if (empty($createRes['success'])) {
    echo "FAIL: createUnavailabilityLogic failed: " . json_encode($createRes) . "\n";
    exit(1);
}

// Verify appointment was marked cancelled
$stmt = $pdo->prepare("SELECT status, queue_status FROM apointements WHERE id = ?");
$stmt->execute([$apptId]);
$updatedAppt = $stmt->fetch(PDO::FETCH_ASSOC);

if ((int)$updatedAppt['status'] !== 2 || $updatedAppt['queue_status'] !== 'cancelled') {
    echo "FAIL: Appointment was not cancelled. Status: {$updatedAppt['status']}, Queue: {$updatedAppt['queue_status']}\n";
    exit(1);
}
echo "PASS: Conflicting appointment was successfully auto-cancelled.\n";

// Verify notification was created
$stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND title LIKE '%إلغاء%'");
$stmt->execute([$patient['user_id']]);
$notifCount = (int)$stmt->fetchColumn();
if ($notifCount < 1) {
    echo "FAIL: Notification was not created for patient.\n";
    exit(1);
}
echo "PASS: Patient notification was successfully created.\n";

// Clean up test data
$pdo->prepare("DELETE FROM doctor_unavailabilities WHERE doctor_id = ? AND start_datetime LIKE ?")
    ->execute([$doctorId, "$testDate%"]);
$pdo->prepare("DELETE FROM apointements WHERE id = ?")->execute([$apptId]);

echo "ALL TESTS PASSED for Doctor Unavailabilities & Conflict Engine!\n";
exit(0);
