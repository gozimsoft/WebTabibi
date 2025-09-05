<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("controllers.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? "";

  if ( $id === "") {
    echo json_encode([
        "success" => fasle,
        "message" => "ID is missing"
    ]);
    exit;
}
 
  echo CheckLoginWithID($id);
