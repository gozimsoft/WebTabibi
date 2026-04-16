<?php
header('Content-Type: application/json; charset=utf-8');
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

// استعلام الولايات
$stmt = $pdo->query("SELECT ID, Num, NameAr, NameFr FROM Wilayas");
$wilayas = $stmt->fetchAll(PDO::FETCH_ASSOC);

// إرسال الرد
echo json_encode([
    'status' => 'success',
    'data' => $wilayas
]);
