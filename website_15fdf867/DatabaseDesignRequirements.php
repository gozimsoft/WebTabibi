<?php

session_start();
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit();
}

?>

<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600&display=swap" rel="stylesheet">
    <title>شروط تصميم قاعدة البيانات</title>
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            margin: 0;
            padding: 0;
            background-color: #f4f4f9;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #fff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
        }

        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 20px;
        }

        p {
            margin: 10px 0;
            font-size: 1.1rem;
        }

        p span {
            color: red;
            font-weight: bold;
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
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>شروط تصميم قاعدة البيانات</h1>
        <p>يجب أن يكون اسم الجدول جمعًا، وينتهي بحرف <span>s</span>، مثال: <b>Clients</b>.</p>
        <p>يجب أن يكون اسم حقل المفتاح الأساسي <b>ID</b>.</p>
        <p>يجب أن يكون نوع حقل المفتاح الأساسي <b>char(36)</b>.</p>
        <p>بالنسبة للمفتاح الخارجي، يجب أن يتكون من اسم الجدول الأب مفردًا دون حرف <span>s</span> مضافًا إليه <b>_ID</b>، مثال: <b>User_ID</b> عندما يكون اسم الجدول الأب <b>Users</b>.</p>
        <a href="index.php">العودة إلى الصفحة الرئيسية</a>
    </div>
</body>
</html>



 