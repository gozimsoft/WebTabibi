<?php
header("Content-Type: application/json");

require_once("config.php");  

$data = json_decode(file_get_contents("php://input"), true);
$phone = $data['phone'] ?? '';

if (empty($phone)) {
    echo json_encode(['status' => 'fail', 'message' => 'Phone number lost']);
    exit;
}

$code =  '0000' ; //str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
 
echo json_encode(['status' => 'success', 'message' => 'The code has been sent.', 'code' => $code]);
