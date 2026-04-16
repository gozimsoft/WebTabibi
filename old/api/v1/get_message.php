<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("auth.php");

// التحقق من التوكن
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

$session = validateToken($token);
if (!$session) {
    echo json_encode(['status' => 'fail', 'message' => 'Invalid token']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$MessageThread_id = $data["message_thread_id"] ?? '';

$doctor_id = $session['doctor_id'] ?? '';

$stmt = $pdo->prepare("
    SELECT 
       Messages.*
    FROM Messages inner join MessageThreads on MessageThreads.ID = Messages.MessageThread_id
    WHERE 
      MessageThread_id = :message_thread_id 
      and MessageThreads.Doctor_id = :doctor_id
    ");
$stmt->execute([
    ':doctor_id' => $doctor_id  ,  
    ':message_thread_id' => $MessageThread_id
]);


$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode([
    'status' => 'success',
    'data' => $rows
]);
exit ;