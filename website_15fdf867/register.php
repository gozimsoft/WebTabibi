<?php
include 'database.php';


if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $email = $_POST['email']; 
    $phone =  $_POST['phone']; 
    $points = 0; // النقاط الافتراضية عند إنشاء الحساب

    $stmt = $db->prepare("INSERT INTO users (username, password, points,email , phone) VALUES (:username, :password, :points,:email, :phone)");
    try {
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':points', $points);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
        $stmt->execute();
        header("Location: login.php");
        exit();
    } catch (Exception $e) {
        $error = "اسم المستخدم موجود بالفعل.";
    }
}
?>
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إنشاء حساب جديد</title>
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
        }

        .container {
            background-color: #ffffff;
            border: 2px solid #4CAF50;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
            width: 300px;
        }

        h1 {
            color: #4CAF50;
            font-size: 24px;
            margin-bottom: 20px;
        }

        form input {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
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

        p {
            margin-top: 10px;
        }

        p a {
            color: #4CAF50;
            text-decoration: none;
            font-weight: bold;
        }

        p a:hover {
            text-decoration: underline;
        }

        .error {
            color: red;
            font-size: 14px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>إنشاء حساب جديد</h1>
        <?php if (!empty($error)) echo "<p class='error'>$error</p>"; ?>
        <form method="post">
            <input type="text" name="username" placeholder="اسم المستخدم" required>
            <input type="password" name="password" placeholder="كلمة المرور" required>
            <input type="email" name="email" placeholder="البريد الإلكتروني" required>
            <input type="text" name="phone" placeholder="رقم الهاتف" required>
            <button type="submit">تسجيل</button>
        </form>
        <p>لديك حساب بالفعل؟ <a href="login.php">تسجيل الدخول</a></p>
    </div>
</body>
</html>
