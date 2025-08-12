<?php
session_start();
include 'database.php';

// التحقق من تسجيل دخول المستخدم
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

// جلب الرسائل من قاعدة البيانات
$stmt = $db->prepare("SELECT  cm.id, cm.subject, cm.content, cm.created_at, u.username 
                        FROM contact_messages cm 
                        JOIN users u ON cm.user_id = u.id 
                        ORDER BY cm.created_at DESC");
$stmt->execute();
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="myicon.png">
    <title>عرض الرسائل</title>
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            text-align: center;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
            direction: rtl;
        }
        .container {
            max-width: 100%;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0; 
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 10px;
            text-align: center;
        }
        th {
            background-color: #007BFF;
            color: #fff;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
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
        <h2>سجل الرسائل</h2>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>اسم المستخدم</th>
                    <th>عنوان الموضوع</th>
                    <th>الرسالة</th>
                    <th>التاريخ</th>
                </tr>
            </thead>
            <tbody>
                <?php if (count($messages) > 0): ?>
                    <?php foreach ($messages as $index => $message): ?>
                        <tr>
                            <td><?php echo $index + 1; ?></td>
                            <td><?php echo htmlspecialchars($message['username']); ?></td>
                            <td><?php echo htmlspecialchars($message['subject']); ?></td>
                            <td><?php echo htmlspecialchars($message['content']); ?></td>
                            <td><?php echo htmlspecialchars($message['created_at']); ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="5">لا توجد رسائل حتى الآن.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</body>
</html>