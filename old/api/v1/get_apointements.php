<?php
header("Content-Type: application/json");
require_once("config.php");


// ✅ استقبال البيانات من JSON
$data = json_decode(file_get_contents("php://input"), true);
$doctor_id = $data['Doctor_id'] ?? '';


$stmt = $pdo->prepare("
    SELECT 
        Apointements.ID,
        Apointements.Note,
        Apointements.Reason_id,
        Apointements.AppointementDate,
        Apointements.Doctor_id,
        Patients.Fullname,
        Patients.Phone        
    FROM Apointements
    LEFT JOIN Patients ON Patients.ID = Apointements.Patient_id
    WHERE Apointements.Doctor_id = :doctor_id
    AND Apointements.AppointementDate >= NOW()
");
$stmt->execute([':doctor_id' => $doctor_id]);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'success', 'data' => $data]);
