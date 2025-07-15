<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/SMTP.php';
require 'PHPMailer/PHPMailer.php'; 
require 'PHPMailer/Exception.php';

function sendMail($to, $subject, $body) {
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
        $mail->setFrom('your@gmail.com', 'Your Name');
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
