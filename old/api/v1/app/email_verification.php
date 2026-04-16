<?php
header("Content-Type: application/json");
require_once("config.php"); // معلومات الاتصال
require_once("app/mailer.php"); // ملف إرسال البريد (مثل PHPMailer)

// استقبال الإيميل من الطلب
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'fail', 'message' => 'بريد غير صالح']);
    exit;
}

// توليد رمز تحقق مكون من 6 أرقام
$code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

// إرسال الإيميل
$subject = "verification code";
$body = "Your verification code is: $code";

if (sendMail($email, $subject, $body)) {
    echo json_encode(['status' => 'success', 'code' => $code]);
} else {
    echo json_encode(['status' => 'fail', 'message' => 'Failed to send mail']);
}

exit;
