<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("auth.php");

// التحقق من التوكن
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

$session = validateToken($token);
if (!$session) {
    echo json_encode(['status' => 'fail', 'message' => 'Invalid token']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// استلام البيانات
$id = $data['id'] ?? '';
$doctor_id = $data['doctor_id'] ?? '';
$reason_id = $data['reason_id'] ?? '';
$phone = $data['phone'] ?? '';
$note = $data['note'] ?? '';
$appointement_date = $data['appointement_date'] ?? null;

if (empty($id) || empty($phone)) {
    echo json_encode(['status' => 'fail', 'message' => 'Missing ID or phone']);
    exit;
}

// الحصول على Patient_id من رقم الهاتف
$stmt = $pdo->prepare("SELECT ID FROM Patients WHERE PhoneValidation = 1 AND Phone LIKE :phone LIMIT 1");
$stmt->execute([':phone' => $phone]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo json_encode(['status' => 'fail', 'message' => 'Patient not found']);
    exit;
}

$patient_id = $row['ID'];

$sql = "INSERT INTO Apointements (
        ID, Doctor_id,  Reason_id,Patient_id,  AppointementDate, Note
    ) VALUES (
        :id, :doctor_id, :reason_id, :patient_id, :appointement_date, :note
    )";
 
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':id' => $id,
    ':doctor_id' => $doctor_id,
   ':appointement_date' => $appointement_date,
   ':reason_id' => $reason_id,
    ':patient_id' => $patient_id,
    ':note' => $note
]);

echo json_encode(['status' => 'success', 'message' => 'Apointement saved']);
?>