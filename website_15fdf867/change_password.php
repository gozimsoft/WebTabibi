<?php
session_start();

// تأكد من تسجيل الدخول
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

include 'database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];

    // تحقق من أن كلمة المرور الجديدة مطابقة للتأكيد
    if ($new_password !== $confirm_password) {
        $error = "كلمتا المرور الجديدتان غير متطابقتين.";
    } else {
        $user_id = $_SESSION['user_id'];
        // جلب كلمة المرور الحالية من قاعدة البيانات        
        $userId = $_SESSION['user_id']  ;
        $stmt = $db->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC); 
 
      

        // تحقق من أن كلمة المرور الحالية صحيحة
        if (!password_verify($current_password, $user['password'])) {
            $error = "كلمة المرور الحالية غير صحيحة.";
        } else {
            // تحديث كلمة المرور الجديدة
            $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);           

            $update_query = $db->prepare("UPDATE users SET password = :password WHERE id = :id");
            $update_query->bindParam(':password', $hashed_password);
            $update_query->bindParam(':id', $userId);
     
            if ( $update_query->execute() ) {
                $success = "تم تغيير كلمة المرور بنجاح.";
            } else {
                $error = "حدث خطأ أثناء تحديث كلمة المرور.";
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="myicon.png">
    <title>تغيير كلمة المرور</title>
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

        .password-box {
            background-color: #fff;
            border: 2px solid green;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }

        .password-box h1 {
            margin-bottom: 20px;
            font-size: 24px;
            color: green;
            font-family: 'Cairo', sans-serif;
        }

        .password-box p {
            margin: 10px 0;
            font-size: 16px;
        }

        .password-box form {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .password-box label {
            font-size: 14px;
            margin-bottom: 2px;
            color: #333;
            font-family: 'Cairo', sans-serif;
        }

        .password-box input {
            width: 100% ;
            padding: 5px;
           
            border: 1px solid #ccc;
            border-radius: 5px;
        }

        .password-box button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background-color: green;
            margin-top:5px;
            color: #fff;
            cursor: pointer;
            font-family: 'Cairo', sans-serif;
            transition: background-color 0.3s;
        }

        .password-box button:hover {
            background-color: darkgreen;
        }

        .password-box a {
            display: inline-block;
            margin-top: 10px;
            text-decoration: none;
            color: green;
            font-size: 14px;
            transition: color 0.3s;
        }

        .password-box a:hover {
            color: darkgreen;
        }
    </style>
</head>
<body>
    <div class="password-box">
        <h1>تغيير كلمة المرور</h1>
        
        <?php if (!empty($error)): ?>
            <p style="color: red;"><?= htmlspecialchars($error); ?></p>
        <?php endif; ?>

        <?php if (!empty($success)): ?>
            <p style="color: green;"><?= htmlspecialchars($success); ?></p>
        <?php endif; ?>

        <form method="POST" action="">
            <label for="current_password">كلمة المرور الحالية:</label>
            <input type="password" name="current_password" id="current_password" required>

            <label for="new_password">كلمة المرور الجديدة:</label>
            <input type="password" name="new_password" id="new_password" required>

            <label for="confirm_password">تأكيد كلمة المرور الجديدة:</label>
            <input type="password" name="confirm_password" id="confirm_password" required>

            <button type="submit">تحديث</button>
        </form>

        <a href="profile.php">الرجوع إلى الصفحة الشخصية</a>
    </div>
</body>
</html>
