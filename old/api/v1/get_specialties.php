<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("auth.php");

// ✅ تحقق من التوكن
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['status' => 'fail', 'message' => 'Token missing']);
    exit;
}
$token = $matches[1];

$session = validateToken($token);
if (!$session) {
    http_response_code(401);
    echo json_encode(['status' => 'fail', 'message' => 'Invalid token']);
    exit;
}

// ✅ استعلام التخصصات
$stmt = $pdo->prepare("SELECT ID, NameAr, NameFr FROM Specialties");
$stmt->execute();
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'status' => 'success',
    'data' => $rows
]);
