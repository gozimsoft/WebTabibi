<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("auth.php");

 
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
$phone = $data['phone'] ?? '';
$email = $data['email'] ?? '';

  
 

// الحصول على Patient_id من رقم الهاتف
$stmt = $pdo->prepare("SELECT * FROM Patients WHERE ( PhoneValidation = 1 AND Phone LIKE :phone) 
 or ( EmailValidation = 1 AND Email LIKE :email)   LIMIT 1");
$stmt->execute([':phone' => $phone ,
':email' => $email
]  );
$row = $stmt->fetch(PDO::FETCH_ASSOC);


  echo json_encode(['status' => 'fail', 'message' => $phone]);
    exit;


if (!$row) {
    echo json_encode(['status' => 'fail', 'message' => 'Patient not found']);
    exit;
}

$patient_id = $row['ID'];


echo json_encode(['status' => 'success', 'message' => 'Apointement saved']);

 

?>