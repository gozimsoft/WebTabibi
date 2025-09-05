<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("auth.php");
 
/*
// تحقق من التوكن
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = trim(str_replace('Bearer', '', $authHeader));
$session = validateToken($token);
if (!$session) {
    echo json_encode(['status' => 'fail', 'message' => 'Invalid token']);
    exit;
}
 */


$data = json_decode(file_get_contents("php://input"), true);
$items = $data['items'] ?? [];
$doctor_id = $data['doctor_id'] ?? '';



if (empty($doctor_id)) {
    echo json_encode(['status' => 'fail', 'message' => 'Missing doctor_id in session']);
    exit;
}


// حذف القديم
$pdo->prepare("DELETE FROM DoctorsReasons WHERE Doctor_id = ?")->execute([$doctor_id]);

$stmt = $pdo->prepare("INSERT INTO DoctorsReasons (ID, Reason_id, Doctor_id) VALUES (?, ?, ?)");

foreach ($items as $item) {
    if (!isset($item['id'], $item['reason_id']))
        continue;
    $stmt->execute([
        $item['id'],
        $item['reason_id'],
        $doctor_id
    ]);
}


echo json_encode(['status' => 'success', 'message' => 'Doctors Reasons uploaded']);

exit;
