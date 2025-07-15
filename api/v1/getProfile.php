<?php
require_once("auth.php");

$headers = getallheaders();
$token = $headers["Authorization"] ?? "";

$session = validateToken($token);
if (!$session) {
    http_response_code(401);
    echo json_encode(["status" => "fail", "message" => "Unauthorized"]);
    exit;
}

// الآن لديك $session["user_id"] ويمكنك تحميل بيانات المستخدم





