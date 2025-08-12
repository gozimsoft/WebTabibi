<?php
ob_start();
session_start();
include 'database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $db->prepare("SELECT * FROM users WHERE username = :username  or email = :username ");
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);    
    if ($user && password_verify($password, $user['password'])) {
        $typeuser =$user['typeuser'];
        $_SESSION['username'] = $username;
        $_SESSION['points'] = $user['points']; // إضافة النقاط إلى الجلسة
        $_SESSION['user_id'] = $user['id']; // إضافة النقاط إلى الجلسة      
        $_SESSION['typeuser'] = $user['typeuser']; // إضافة النقاط إلى الجلسة              
        header("Location: index.php");       
        exit();
    } else {
        $error = "اسم المستخدم أو كلمة المرور غير صحيحة.";
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
       <title>تسجيل الدخول</title>
    <style>
        @media (max-width: 768px) {
        .container {
            flex-direction: column;
            align-items: center;
        }
        .login-box, .sidebar {
            max-width: 90%;
            width: 100%;
        }
        }
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;            
            min-height: 100vh;
            direction: rtl;
        }
        .container {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: flex-start;
            gap: 20px;
            width: 90%;
            max-width: 1200px;
        }
        .login-box {
            background-color: #fff;
            border: 2px solid green;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }
        .login-box h1 {
            margin-bottom: 20px;
            font-size: 24px;
            color: green;
        }
        .login-box p {
            margin: 10px 0;
            font-size: 16px;
            font-family: 'Cairo', sans-serif;
        }
        .login-box form {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
        }
        .login-box input {
            width: 95%;
            padding: 2%;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        .login-box button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background-color: green;
            color: #fff;
            cursor: pointer;
            transition: background-color 0.3s;
            width: 50%;
        }
        .login-box button:hover {
            background-color: darkgreen;
        }
        .login-box a {
            display: inline-block;
            margin-top: 10px;
            text-decoration: none;
            color: green;
            font-size: 14px;
            transition: color 0.3s;
            font-family: 'Cairo', sans-serif;
        }
        .login-box a:hover {
            color: darkgreen;
        }
        .sidebar {
            background-color: #e8f5e9;
            border: 1px solid green;
            border-radius: 10px;
            padding: 20px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            font-size: 14px;
            color: #2e7d32;
            line-height: 1.6;
        }
        .sidebar h2 {
            color: green;
            font-size: 18px;
            margin-bottom: 10px;
        }
        .sidebar ul {
            list-style-type: disc;
            margin-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <h2>تقدم شركة <strong>StellarSoft</strong> حلاً مبتكرًا</h2>
            <p>وفرنا الكم موقع DPG (Delphi project generation)  يقدم حلاً مبتكرًا ومميزًا للمطورين وأصحاب الأعمال الذين يحتاجون إلى تسريع عملية تطوير البرامج. يتيح الموقع للمستخدمين إرسال قاعدة بيانات من أي نوع، ليقوم الموقع تلقائيًا بإنشاء مشروعين جاهزين بالكامل باستخدام Delphi:</p>
            <ul>
                <li><strong>مشروع سطح المكتب:</strong> مصمم للعمل على أنظمة التشغيل المختلفة بواجهة احترافية.</li>
                <li><strong>مشروع أندرويد:</strong> متوافق مع الأجهزة المحمولة ويوفر تجربة مستخدم مميزة.</li>
            </ul>
            <p><strong>أهم المزايا التي يقدمها الموقع:</strong></p>
            <ul>
                <li>كود نظيف ومرتب: جميع المشاريع التي يتم إنشاؤها تعتمد على معايير برمجية عالية الجودة لتسهيل القراءة والصيانة.</li>
                <li>تقنية MVC: تقسيم الكود إلى طبقات (النموذج، العرض، والتحكم) مما يعزز قابلية التوسعة والصيانة.</li>
                <li>مرونة التخصيص: يمكن للمستخدم إعادة تصميم النوافذ بسهولة بما يتناسب مع احتياجاته أو تعديل المشروع لتلبية متطلباته الخاصة.</li>
                <li>دعم أنواع متعددة من قواعد البيانات: يدعم الموقع قواعد بيانات متنوعة، مما يجعله أداة شاملة للمطورين بغض النظر عن نوع المشروع.</li>
                <li>توفير الوقت والجهد: بدلاً من البدء من الصفر، يقدم الموقع مشاريع جاهزة للاستخدام أو التعديل، مما يساعد على تقليل وقت التطوير بشكل كبير.</li>
            </ul>
            <p>لماذا يعتبر DPG خيارًا مثاليًا؟</p>
            <p>يتميز الموقع بقدرته على تمكين المستخدم من الحصول على مشاريع بجودة احترافية دون الحاجة إلى خبرة عميقة في البرمجة، مما يجعله أداة فعالة لكل من المبتدئين والمحترفين على حد سواء.</p>
        </div>
        <div class="login-box">
            <h1>تسجيل الدخول</h1>        
            <?php if (!empty($error)) echo "<p style='color:red;'>$error</p>"; ?>
            <form method="post">
                <input type="text" name="username" placeholder="اسم المستخدم أو البريد الالكتروني" required>
                <input type="password" name="password" placeholder="كلمة المرور" required>
                <button type="submit">دخول</button>
            </form>
            <p>لا تملك حسابًا؟ <a href="register.php">إنشاء حساب جديد</a></p>
        </div>
    </div>
</body>
</html>
