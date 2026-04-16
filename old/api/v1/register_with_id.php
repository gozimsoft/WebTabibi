<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("controllers.php");

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data["user_id"] ?? '';
$doctor_id = $data["doctor_id"] ?? '';
$userType =  1;

// تحقق من البيانات
if (empty($doctor_id) || empty($user_id) ) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit;
}

// تحقق إن كان المستخدم موجود
$stmt = $pdo->prepare("SELECT COUNT(*) FROM Users WHERE ID = :id");
$stmt->execute([":id" => $user_id]);
if ($stmt->fetchColumn() > 0) {
    echo json_encode([
        "success" => false,
        "message" => "User already exists"
    ]);
    exit;
}

// إضافة الحساب
$insertUser = $pdo->prepare("INSERT INTO Users (ID, Username, Password, UserType) VALUES (:id, :username, :password, :usertype)");
$userSuccess = $insertUser->execute([
    ":id" => $user_id,
    ":username" =>  generateUUIDv4()  ,
    ":password" => generateUUIDv4()  ,
    ":usertype" => $userType
]);

// إضافة حساب الطبيب
$insertDoctor = $pdo->prepare("INSERT INTO Doctors (ID,User_id, FullName) VALUES (:id, :User_id, :FullName )");
$doctorSuccess = $insertDoctor->execute([
    ":id" => $doctor_id,
    ":User_id" => $user_id,
    ":FullName" => 'Name unknown'
]);

if ($userSuccess && $doctorSuccess) {
    echo json_encode([
        "success" => true,
        "message" => "Account created"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to create account"
    ]);
}


?>
