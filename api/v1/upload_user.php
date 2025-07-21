<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("controllers.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? '';
$username = $data["username"] ?? '';
$password = $data["password"] ?? '';
$userType = $data["userType"] ?? 1;

// تحقق من البيانات
if (empty($id) || empty($username) || empty($password)) {
    echo json_encode([
        "status" => "fail",
        "message" => "Missing required fields"
    ]);
    exit;
}

// تحقق إن كان المستخدم موجود
$stmt = $pdo->prepare("SELECT COUNT(*) FROM Users WHERE ID = :id");
$stmt->execute([":id" => $id]);
if ($stmt->fetchColumn() > 0) {
    echo json_encode([
        "status" => "fail",
        "message" => "User already exists"
    ]);
    exit;
}

if ($id === ''){
      echo json_encode([
        "status" => "fail",
        "message" => "ID is Empty"    ]);
    exit;  
}

// إضافة الحساب
$update = $pdo->prepare("update Users set  Username = :username
                                and Password = :password and UserType = :usertype 
                                where ID = :id  ");
$success = $update->execute([
    ":id" => $id,
    ":username" => $username,
    ":password" => xorEncrypt($password) ,
    ":usertype" => $userType
]);

if ($success) {
    echo json_encode([
        "status" => "success",
        "message" => "Account update"
    ]);
} else {
    echo json_encode([
        "status" => "fail",
        "message" => "Failed to update account"
    ]);
}


?>
