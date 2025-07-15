<?php
header("Content-Type: application/json");
require_once("config.php");

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

// إضافة الحساب
$insert = $pdo->prepare("INSERT INTO Users (ID, Username, Password, UserType) VALUES (:id, :username, :password, :usertype)");
$success = $insert->execute([
    ":id" => $id,
    ":username" => $username,
    ":password" => $password,
    ":usertype" => $userType
]);

if ($success) {
    echo json_encode([
        "status" => "success",
        "message" => "Account created"
    ]);
} else {
    echo json_encode([
        "status" => "fail",
        "message" => "Failed to create account"
    ]);
}


?>
