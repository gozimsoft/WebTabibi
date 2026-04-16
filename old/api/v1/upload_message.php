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

// استلام البيانات
$id = $data['id'] ?? '';
$message_thread_id = $data['message_thread_id'] ?? '';
$content_message = $data['content_message'] ?? '';
$is_doctor = isset($data['is_doctor']) && filter_var($data['is_doctor'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$date_send = $data['date_send'] ?? null;
 
if ( $id === ''  ) {
    echo json_encode(['status' => 'fail', 'message' => 'Missing ID ']);
    exit;
}
 
$sql = "INSERT INTO Messages (
        ID, MessageThread_id, ContentMessage, IsDoctor, DateSend
    ) VALUES (
        :id, :message_thread_id, :content_message, :is_doctor, :date_send
    )";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':id' => $id,
    ':message_thread_id' => $message_thread_id,
    ':content_message' => $content_message,
    ':is_doctor' => $is_doctor,
    ':date_send' => $date_send
]);
   
echo json_encode(['status' => 'success', 'message' => 'Apointement saved']);
?>