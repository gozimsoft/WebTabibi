<?php
header("Content-Type: application/json");

require_once("../config.php");
require_once("../auth.php");
require_once("../controllers.php");

// ✅ قراءة التوكن من الهيدر
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['status' => 'fail', 'message' => 'Unauthorized - Token missing']);
    exit;
}
$token = $matches[1];

// ✅ التحقق من التوكن
$session = validateToken($token);
if (!$session) {
    http_response_code(401);
    echo json_encode(['status' => 'fail', 'message' => 'Invalid token']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$ID = $data['ID'] ?? '';
$Patient_id = $data['Patient_id'];
$Reason_id = $data['Reason_id'] ?? '';
$Clinic_ID = $data['Clinic_ID'] ?? '';
$Doctor_ID = $data['Doctor_ID'] ?? '';
$Note = $data['Note'] ?? '';
$AppointementDate = $data['AppointementDate'] ?? null;

// ✅ تحقق من الازدواجية
$stmt = $pdo->prepare("
    SELECT ID 
    FROM Apointements 
    WHERE Patient_id = :Patient_id 
      AND Doctor_ID = :Doctor_ID 
      AND AppointementDate = :AppointementDate
");
$stmt->execute([
    ':Doctor_ID' => $Doctor_ID,
    ':Patient_id' => $Patient_id,
    ':AppointementDate' => $AppointementDate
]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    // ✅ إدراج الموعد
    $sql = "INSERT INTO Apointements (
        ID, Doctor_id, Reason_id, Patient_id, Clinic_id, AppointementDate, Note
    ) VALUES (
        :id, :doctor_id, :reason_id, :patient_id, :clinic_id, :appointement_date, :note
    )";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $ID,
        ':doctor_id' => $Doctor_ID,
        ':reason_id' => $Reason_id,
        ':patient_id' => $Patient_id,
        ':clinic_id' => $Clinic_ID,
        ':appointement_date' => $AppointementDate,
        ':note' => $Note
    ]);
    $stmt = $pdo->prepare("
    SELECT Email  FROM Patients  WHERE ID = :Patient_id  ");
    $stmt->execute([':Patient_id' => $Patient_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $email = $row['Email'];
    
    echo json_encode(['status' => 'success', 'email' => $email, 'message' => 'Apointement saved']);
} else {
    echo json_encode(['status' => 'fail', 'message' => 'Duplicate appointment']);
}
exit;
