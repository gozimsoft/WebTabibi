<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("auth.php");

// تحقق من التوكن
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    echo json_encode(['status' => 'fail', 'message' => 'Token required']);
    exit;
}

$token = trim(str_replace('Bearer', '', $headers['Authorization']));
$session = validateToken($token);
if (!$session) {
    echo json_encode(['status' => 'fail', 'message' => 'Invalid token']);
    exit;
}

// حذف القديم

// تحقق من وجود Doctor_id
$doctor_id = $session['doctor_id'] ?? '';
if (empty($doctor_id)) {
    echo json_encode(['status' => 'fail', 'message' => 'Missing doctor_id in session']);
    exit;
}

$pdo->prepare("DELETE FROM DoctorsOffHours WHERE Doctor_id = ?")->execute([$doctor_id]);

// إدخال جديد
$data = json_decode(file_get_contents("php://input"), true);
$items = $data['items'] ?? [];

$stmt = $pdo->prepare("INSERT INTO DoctorsOffHours (ID, Day, TimeBegin, TimeEnd, Doctor_id) VALUES (?, ?, ?, ?, ?)");

foreach ($items as $item) {
    $stmt->execute([
        $item['id'],
        $item['day'],
        $item['time_begin'],
        $item['time_end'],
        $doctor_id
    ]);
}

echo json_encode(['status' => 'success', 'message' => 'Off hours uploaded']);
