<?php
header("Content-Type: application/json");
require_once("config.php");

$data = json_decode(file_get_contents("php://input"), true);

// استلام البيانات
$id = $data['id'] ?? '';
$doctor_id = $data['doctor_id'] ?? '';
$clinic_id = $data['clinic_id'] ?? '';
$reason_id = $data['reason_id'] ?? '';
$phone = $data['phone'] ?? '';
$note = $data['note'] ?? '';
$PatientName = $data['PatientName'] ?? '';
$appointement_date = $data['appointement_date'] ?? null;


if (empty($doctor_id) || empty($clinic_id)   ) {
    echo json_encode(['status' => 'fail', 'message' => 'Missing ID or phone']);
    exit;
}



 // ClinicsDoctors
$stmt = $pdo->prepare("SELECT ID FROM ClinicsDoctors WHERE doctor_id = :doctor_id AND doctor_id = :doctor_id  LIMIT 1");
$stmt->execute([':doctor_id' => $doctor_id , ':clinic_id' => $clinic_id ]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
$clinicsdoctor_id = $row['ID'];


 $patient_id = '';
// الحصول على Patient_id من رقم الهاتف
$stmt = $pdo->prepare("SELECT ID FROM Patients WHERE PhoneValidation = 1 AND Phone LIKE :phone LIMIT 1");
$stmt->execute([':phone' => $phone]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$row) {
   $patient_id = $row['ID'];
}

$sql = "INSERT INTO Apointements (
        ID,   Reason_id,Patient_id, ClinicsDoctor_id, AppointementDate, Note,PatientName
    ) VALUES (
        :id,  :reason_id, :patient_id,:clinicsdoctor_id, :appointement_date, :note,:PatientName
    )";
 
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':id' => $id,    
    ':appointement_date' => $appointement_date,
    ':reason_id' => $reason_id,
    ':patient_id' => $patient_id,
    ':clinicsdoctor_id' => $clinicsdoctor_id,    
    ':note' => $note,
    ':PatientName' => $PatientName
    
]);

echo json_encode(['status' => 'success', 'message' => 'Apointement saved']);

?>