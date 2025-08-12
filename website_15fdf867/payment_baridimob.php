<?php
session_start();

// التأكد من أن المستخدم مسجل دخول
if (!isset($_SESSION['username']) || !isset($_GET['amount'])) {
    header("Location: login.php");
    exit();
}

// الحصول على البيانات المطلوبة
$username = $_SESSION['username'];
$amount = $_GET['amount'] * 250 ;
$points = $_GET['points'];
$userId = $_SESSION['user_id'] ?? 'unknown'; // تأكد من وجود user_id في الجلسة
?>

<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="myicon.png">
      <title>الدفع بواسطة بايبال</title>
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            text-align: center;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 500px;
            margin: 50px auto;
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            font-size: 18px;
            margin: 10px 0;
        }
        input[type="file"], button {
            width: 100%;
            padding: 5px 0px;
            margin: 5px 0px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        button {
            background-color: #007BFF;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            border: none;
        }
        button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>المبلغ المطلوب: <?php echo htmlspecialchars($amount); ?> دج </h1>
        <h1> لشحن : <?php echo htmlspecialchars($points); ?> نقطة </h1>
        <p>يرجى إرسال المبلغ إلى الحساب التالي:</p>
        <p><strong>baridi mob : 99999002088556676 </strong></p>
        <form action="process_payment_ccp.php" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="amount" value="<?php echo htmlspecialchars($amount); ?>">
            <input type="hidden" name="points" value="<?php echo htmlspecialchars($points); ?>">
            <input type="hidden" name="payment_method" value="baridi mob">
            <label for="receipt">أرفق سند الإرسال (صورة أو PDF):</label>
            <input type="file" id="receipt" name="receipt" accept=".jpg,.jpeg,.png,.pdf" required>
            <button type="submit">إرسال</button>
        </form>
    </div>
</body>
</html>
