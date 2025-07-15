<?php
header("Content-Type: application/json");
require_once("config.php"); // معلومات الاتصال
require_once("mailer.php"); // ملف إرسال البريد (مثل PHPMailer)

// استقبال الإيميل من الطلب
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'fail', 'message' => 'بريد غير صالح']);
    exit;
}
// تحقق إن كان المستخدم موجود
$stmt = $pdo->prepare("
Select * FROM ( SELECT User_id FROM Doctors   where email = :email
union all 
SELECT User_id FROM  Patients where email = :email ) limit 1  
");
$stmt->execute([":email" => $email]);
if ($row = $stmt->fetch(PDO::FETCH_ASSOC) ) {

    $stmt = $pdo->prepare("SELECT Password FROM Users WHERE ID = :User_id");
    $stmt->execute([":User_id" => $row['User_id']]);
    if ($row = $stmt->fetch(PDO::FETCH_ASSOC) ) {
        $password = $row['Password'] ;
    }
}
// إرسال الإيميل
$subject = "Password recovery";
$body = "Your password is: $password";

if (sendMail($email, $subject, $password)) {
    echo json_encode(['status' => 'success','message' => 'send password to mail']);
} else {
    echo json_encode(['status' => 'fail', 'message' => 'Failed to send mail']);
}

exit;
