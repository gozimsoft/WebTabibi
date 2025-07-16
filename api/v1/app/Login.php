<?php
header("Content-Type: application/json");
require_once("../controllers.php");


$data = json_decode(file_get_contents("php://input"), true);

 
// التحقق من وجود البيانات
$username = $data["username"] ?? "";
$password = $data["password"] ?? "";

  if ($username === "" || $password === "")  {
    echo json_encode([
        "status" => "fail",
        "message" => "Username or password is missing"
    ]);
    exit;
}

 echo CheckLogin($username, $password);


