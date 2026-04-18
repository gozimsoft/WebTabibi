<?php
header("Content-Type: application/json");
require_once("config.php");


// ✅ استقبال البيانات من JSON
$data = json_decode(file_get_contents("php://input"), true);
$doctor_id = $data['doctor_id'] ?? '';
$clinic_id = $data['clinic_id'] ?? '';

if (empty($doctor_id) || empty($clinic_id)) {
    echo json_encode(['status' => 'fail', 'message' => 'Missing doctor_id or clinic_id']);
    exit;
}

$stmt = $pdo->prepare("
    SELECT 
        a.ID,
        a.Note,
        a.Reason_id,
        a.AppointementDate,        
        p.Fullname,
        p.Phone        
    FROM Apointements a
    INNER JOIN ClinicsDoctors cd ON cd.ID = a.ClinicsDoctor_id
    LEFT JOIN Patients p ON p.ID = a.Patient_id
    WHERE cd.Doctor_id = :doctor_id AND cd.Clinic_id = :clinic_id 
    AND a.AppointementDate >= CURDATE()
");
$stmt->execute([':doctor_id' => $doctor_id , ':clinic_id' => $clinic_id ]);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'success', 'data' => $data]);
