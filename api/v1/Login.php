<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("controllers.php");

$data = json_decode(file_get_contents("php://input"), true);

$username = $data["username"] ?? "";
$password = $data["password"] ?? "";

  if ($username === "" || $password === "") {
    echo json_encode([
        "status" => "fail",
        "message" => "Username or password is missing"
    ]);
    exit;
}
 
 echo CheckLogin($username, $password);

 