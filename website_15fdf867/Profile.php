<?php
session_start();
include 'database.php';

// تأكد من تسجيل الدخول
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
// جلب بيانات المستخدم من قاعدة البيانات

 
 
$userId = $_SESSION['user_id']  ;
$stmt = $db->prepare("SELECT * FROM users WHERE id = :id");
$stmt->bindParam(':id', $userId);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);  


?>
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="myicon.png">
    <title>عرض المعلومات</title>
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            direction: rtl;
        }

        .info-box {
            background-color: #fff;
            border: 2px solid green;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }

        .info-box h1 {
            margin-bottom: 20px;
            font-size: 24px;
            color: green;
            font-family: 'Cairo', sans-serif;
        }

        .info-box p {
            margin: 10px 0;
            font-size: 16px;
            color: #333;
            font-family: 'Cairo', sans-serif;
        }


        .info-box a:hover {
            background-color: darkgreen;
        }
        .return {
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
        .eturn:hover {
            text-decoration: underline;
            background-color: #007BFF;
        }
        

        .backfor  {
            display: inline-block;
            margin: 10px 5px;
            padding: 10px 15px;
            text-decoration: none;
            color: #fff;
            border-radius: 5px;
            transition: background-color 0.3s;
            font-family: 'Cairo', sans-serif;
            background-color: green;
        }
        
    </style>
</head>
<body>
    <div class="info-box">
        <a class="return" href="index.php">العودة إلى الصفحة الرئيسية</a>
        <hr>
        <h1>معلومات المستخدم</h1>
        <p><strong>اسم المستخدم:</strong> <?php echo htmlspecialchars($user['username']); ?></p>
        <p><strong>البريد الإلكتروني:</strong> <?php echo htmlspecialchars($user['email']); ?></p>
        <p><strong>الهاتف:</strong> <?php echo htmlspecialchars($user['phone']); ?></p>
        <a class="backfor" href="change_password.php">تغيير كلمة المرور</a>
        <a class="backfor" href="logout.php">تسجيل الخروج</a>
    </div>
</body>
</html>
