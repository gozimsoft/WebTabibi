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

$doctor_id = $session['doctor_id'] ?? '';

$stmt = $pdo->prepare("
    SELECT 
        *
    FROM MessageThreads 
    WHERE Doctor_id = :doctor_id  
");
$stmt->execute([':doctor_id' => $doctor_id]);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
 
echo json_encode(['status' => 'success', 'data' => $data]);
