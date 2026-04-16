<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("auth.php");

// التحقق من التوكن
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

// جلب بيانات البلديات
$stmt = $pdo->query("SELECT ID, Daira_id, NameAr, NameFr, PostCode FROM Baladiyas");
$baladiyas = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'status' => 'success',
    'data' => $baladiyas
]);
