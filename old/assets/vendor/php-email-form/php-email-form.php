<?php
// إعدادات البريد الإلكتروني
$receiving_email_address = 'you@example.com'; // ✉️ غيّر هذا لبريدك

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name    = strip_tags(trim($_POST["name"]));
    $email   = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $subject = strip_tags(trim($_POST["subject"]));
    $message = trim($_POST["message"]);

    // التحقق من صحة البيانات
    if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($message)) {
        http_response_code(400);
        echo "الرجاء ملء النموذج بشكل صحيح.";
        exit;
    }

    // إعداد محتوى الرسالة
    $email_content  = "الاسم: $name\n";
    $email_content .= "البريد: $email\n";
    $email_content .= "الموضوع: $subject\n\n";
    $email_content .= "الرسالة:\n$message\n";

    $email_headers = "From: $name <$email>";

    // إرسال البريد
    if (mail($receiving_email_address, "رسالة جديدة من موقعك: $subject", $email_content, $email_headers)) {
        http_response_code(200);
        echo "تم إرسال الرسالة بنجاح.";
    } else {
        http_response_code(500);
        echo "حدث خطأ أثناء إرسال الرسالة.";
    }
} else {
    http_response_code(403);
    echo "طلب غير مسموح به.";
}
?>
