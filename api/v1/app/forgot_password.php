<?php
header("Content-Type: application/json");
require_once("../config.php"); // معلومات الاتصال
require_once("../controllers.php");
require_once("mailer.php"); // ملف إرسال البريد (مثل PHPMailer)
// استقبال الإيميل من الطلب
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'fail', 'message' => 'بريد غير صالح']);
    exit;
}

// تحقق إن كان المستخدم موجود
$stmt = $pdo->prepare("
SELECT User_id 
FROM (
    SELECT User_id FROM Doctors WHERE Email = :email
    UNION ALL
    SELECT User_id FROM Patients WHERE Email = :email
) AS combined
LIMIT 1;
 
");
$stmt->execute([":email" => $email]);


if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $User_id = $row['User_id'];

    $stmt = $pdo->prepare("
SELECT Password FROM  Users  WHERE ID = :User_id
");
    $stmt->execute([":User_id" => $User_id]);

    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if ($row['Password'] === '') {
            echo json_encode(['debug' => 'fail', 'message' => '']);
            exit;
        } else {
            $password = xorDecrypt($row['Password']);
        }
    }

}
// إرسال الإيميل
$subject = "Password recovery";
$body = "Your password is: $password ";

if (sendMail($email, $subject, $password)) {
    echo json_encode(['status' => 'success', 'message' => 'send password to mail']);
} else {
    echo json_encode(['status' => 'fail', 'message' => 'Failed to send mail']);
}

exit;
