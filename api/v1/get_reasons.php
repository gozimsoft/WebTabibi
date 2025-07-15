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

// جلب الأسباب
$stmt = $pdo->query("SELECT ID, Name, Categorie_id, Specialtie_id FROM Reasons");
$reasons = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'status' => 'success',
    'data' => $reasons
]);
