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
$MessageThread_id = $data['MessageThread_id'] ?? '';

if (empty($MessageThread_id)) {
    echo json_encode(['status' => 'fail', 'message' => 'Missing MessageThread_id ']);
    exit;
}

// الحصول على Patient_id من رقم الهاتف
$stmt = $pdo->prepare("Update MessageThreads Set IsClose = 1
 WHERE  ID = :MessageThread_id ");
$stmt->execute([':MessageThread_id' => $MessageThread_id]);

echo json_encode(['status' => 'success', 'message' => 'MessageThread is update']);
?>