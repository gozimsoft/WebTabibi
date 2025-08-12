<?php
session_start();
include 'database.php';

// التحقق من تسجيل دخول المستخدم
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION['user_id']; // الحصول على user_id من الجلسة
$message = "";
$error = "";

// التحقق من إرسال النموذج
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $subject = htmlspecialchars(trim($_POST['subject'])); // عنوان الموضوع
    $content = htmlspecialchars(trim($_POST['message'])); // محتوى الموضوع

    // التحقق من البيانات
    if (empty($subject) || empty($content)) {
        $error = "يرجى ملء جميع الحقول.";
    } else {
        // إدخال البيانات في جدول قاعدة البيانات
        $stmt = $db->prepare("INSERT INTO contact_messages (user_id, subject, content) VALUES (:user_id, :subject,:content )");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':subject', $subject);
        $stmt->bindParam(':content', $content);
        // $stmt->bindParam(':created_at', NOW() );
        
        if ($stmt->execute() )  {
            $message = "تم إرسال رسالتك بنجاح.";
        } else {
            $error = "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.";
        }

    }
}
?>


<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>اتصل بنا</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="myicon.png">
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #f0f8ff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            direction: rtl;
        }

        .container {
            background-color: #ffffff;
            border: 2px solid #4CAF50;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
            width: 400px;
        }

        h1 {
            color: #4CAF50;
            font-size: 24px;
            margin-bottom: 20px;
        }

        form input,
        form textarea {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
            font-family: 'Cairo', sans-serif;
        }

        form button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px;
            width: 100%;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }

        form button:hover {
            background-color: #45a049;
        }

        .message {
            color: green;
            margin-bottom: 15px;
        }

        .error {
            color: red;
            margin-bottom: 15px;
        }
        a {
            display: inline-block;
            margin-top: 20px;
            text-decoration: none;
            color: #fff;
            background-color: #3498db;
            padding: 10px 20px;
            border-radius: 5px;
            text-align: center;
            transition: background-color 0.3s ease;
        }
        a:hover {
            text-decoration: underline;
            background-color: #007BFF;
        }
    </style>
</head>
<body>
    <div class="container">
    <a href="index.php">العودة إلى الصفحة الرئيسية</a>
        <h1>اتصل بنا</h1>
        <?php
        // رسالة نجاح أو خطأ
        if (!empty($message)) {
            echo "<p class='message'>$message</p>";
        }
        if (!empty($error)) {
            echo "<p class='error'>$error</p>";
        }
        ?>
        <form method="post">
            <input type="text" name="subject" placeholder="عنوان الموضوع" required>
            <textarea name="message" placeholder="الموضوع" rows="5" required></textarea>
            <button type="submit">إرسال</button>
        </form>
    </div>
</body>
</html>
