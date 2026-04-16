<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/SMTP.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/Exception.php';

require_once("config.php");


function xorEncrypt($text)
{
    $key = 5; // ثابت
    $output = '';
    for ($i = 0; $i < strlen($text); $i++) {
        $output .= chr(ord($text[$i]) ^ $key);
    }
    return base64_encode($output);
}

function xorDecrypt($encoded)
{
    $key = 5;
    $text = base64_decode($encoded);
    $output = '';
    for ($i = 0; $i < strlen($text); $i++) {
        $output .= chr(ord($text[$i]) ^ $key);
    }
    return $output;
}

 
function CheckLoginWithID(string $id): string
{
    global $pdo; // تأكد من وجود $pdo في config.php

    $sql = "
        SELECT 
            Users.ID                                  
        FROM Users        
        INNER JOIN Doctors ON Doctors.User_id = Users.ID
        WHERE 
            Users.ID = :id
            and Users.UserType = 1
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":id" => $id        
    ]);
    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // توليد التوكن
        $token = bin2hex(random_bytes(32)); // 64 حرفًا        
        $insert = $pdo->prepare("INSERT INTO sessions (user_id, token) VALUES (:user_id, :token)");
        $insert->execute([
            ":user_id" => $row["ID"],
            ":token" => $token
        ]);
        return json_encode([
            "success" => true,
            "message" => "Login successful",
            "token" => $token           
        ]);
    } else {
        return json_encode([
            "success" => false,
            "message" => "unavailable"
        ]);
    }
}
function CheckLogin(string $username, string $password): string
{
    global $pdo; // تأكد من وجود $pdo في config.php

    $sql = "
        SELECT 
            Users.ID, 
            UserType, 
            Doctors.ID AS Doctor_id, 
            Patients.ID AS Patient_id
        FROM Users
        LEFT JOIN Patients ON Patients.User_id = Users.ID
        LEFT JOIN Doctors ON Doctors.User_id = Users.ID
        WHERE 
            (Users.Username = :Username 
             OR Patients.email = :Username
             OR Patients.phone = :Username
             OR Doctors.email = :Username
             OR Doctors.phone = :Username)
             AND Users.Password = :Password
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":Username" => $username,
        ":Password" => xorEncrypt($password)
    ]);

    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // توليد التوكن
        $token = bin2hex(random_bytes(32)); // 64 حرفًا
        $usertype = $row['UserType'];
        // حفظ التوكن
        $insert = $pdo->prepare("INSERT INTO sessions (user_id, token) VALUES (:user_id, :token)");
        $insert->execute([
            ":user_id" => $row["ID"],
            ":token" => $token
        ]);

        return json_encode([
            "status" => "success",
            "message" => "Login successful",
            "token" => $token,
            "data" => $row
        ]);
    } else {
        return json_encode([
            "status" => "fail",
            "message" => "Invalid username or password"
        ]);
    }
}

function SendMailContact($from_email,$from_name, $subject, $body): bool
{
    $mail = new PHPMailer(true);
    try {
        // إعدادات SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';         // خادم Gmail SMTP
        $mail->SMTPAuth = true;
        $mail->Username = 'stellarsoftpro@gmail.com';     // بريد Gmail
        $mail->Password = 'equi uawa usrl wpor';  // كلمة مرور التطبيق
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // أو 'tls'
        $mail->Port = 587;

        // إعدادات المرسل والمستقبل
        $mail->setFrom($from_email , $from_name);
        $mail->addAddress('gozimsoft@gmail.com');

        // محتوى الرسالة
        $mail->isHTML(false); // أو true لو أردت HTML
        $mail->Subject = $subject;
        $mail->Body = $body;

        // إرسال
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Mailer Error: " . $mail->ErrorInfo);
        return false;
    }
}

function SendMail($to, $subject, $body): bool
{
    $mail = new PHPMailer(true);
    try {

        // إعدادات SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';         // خادم Gmail SMTP
        $mail->SMTPAuth = true;
        $mail->Username = 'stellarsoftpro@gmail.com';     // بريد Gmail
        $mail->Password = 'equi uawa usrl wpor';  // كلمة مرور التطبيق
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // أو 'tls'
        $mail->Port = 587;

        // إعدادات المرسل والمستقبل
        $mail->setFrom('stellarsoftpro@gmail.com', 'stellarsoft');
        $mail->addAddress($to);

        // محتوى الرسالة
        $mail->isHTML(false); // أو true لو أردت HTML
        $mail->Subject = $subject;
        $mail->Body = $body;

        // إرسال
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Mailer Error: " . $mail->ErrorInfo);
        return false;
    }
}

function CheckEmail(string $email): bool
{
    global $pdo; // تأكد من وجود $pdo في config.php

    $sql = "
        SELECT   ID  FROM Patients        
        WHERE   Email = :Email     ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([":Email" => $email]);

    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        return true;
    } else {


        $sql = "
        SELECT  ID  FROM Doctors        
        WHERE   Email = :Email   ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([":Email" => $email]);
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            return true;
        } else {
            return false;
        }


    }


}

function generateUUIDv4() {
    $data = random_bytes(16);
    // ضبط النسخة (Version 4)
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    // ضبط الـ variant
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}
?>