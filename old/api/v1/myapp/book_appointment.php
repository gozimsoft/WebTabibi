<?php
// book_appointment.php
include_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

// المدخلات المطلوبة: تاريخ الموعد، ملاحظة، مريض_id، طبيب_عيادة_id، سبب_id
if(!empty($data->appointment_date) && !empty($data->patient_id) && !empty($data->clinics_doctor_id)) {
    
    $id = generate_uuid();

    $query = "INSERT INTO Apointements 
              (ID, AppointementDate, Note, Patient_id, ClinicsDoctor_id, DoctorsReason_id) 
              VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($query);

    if($stmt->execute([
        $id, 
        $data->appointment_date, // تنسيق: YYYY-MM-DD HH:MM:SS
        $data->note, 
        $data->patient_id, 
        $data->clinics_doctor_id,
        $data->reason_id
    ])) {
        echo json_encode(["message" => "Appointment booked successfully"]);
    } else {
        echo json_encode(["message" => "Booking failed"]);
    }
} else {
    echo json_encode(["message" => "Missing parameters"]);
}
?>