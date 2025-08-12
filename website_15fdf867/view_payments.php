<?php
session_start();
include 'database.php';

// التأكد من تسجيل الدخول
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit();
}
    // الاتصال بقاعدة البيانات 
     $userId = $_SESSION['user_id']  ;
     $stmt = $db->prepare("SELECT * FROM payments  WHERE user_Id = :id ORDER BY created_at DESC ");
     $stmt->bindParam(':id', $userId);
     $stmt->execute();
     $payments = $stmt->fetchAll(PDO::FETCH_ASSOC); 

?>

<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="myicon.png">
    <title>عرض المدفوعات</title>
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
            font-family: 'Cairo', sans-serif;
        }
        table, th, td {
            border: 1px solid #ddd; 
            font-family: 'Cairo', sans-serif;
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
            font-family: 'Cairo', sans-serif;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.php">العودة إلى الصفحة الرئيسية</a>
        <h2>سجل المدفوعات</h2>        
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>النقط</th>
                    <th>المبلغ</th>
                    <th>طريقة الدفع</th>
                    <th>سند الدفع</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
                <?php if (count($payments) > 0): ?>
                    <?php foreach ($payments as $index => $payment): ?>
                        <tr>
                            <td><?php echo $index + 1; ?></td>
                            <td><?php echo htmlspecialchars($payment['points']); ?></td>                            
                            <td><?php echo htmlspecialchars($payment['amount']); ?></td>
                            <td><?php echo htmlspecialchars($payment['payment_method']); ?></td>
                            <td>
                                <a href="<?php echo htmlspecialchars($payment['receipt_path']); ?>" target="_blank">عرض السند</a>
                            </td>
                            <td><?php echo htmlspecialchars($payment['created_at']); ?></td>
                            <td><?php echo htmlspecialchars($payment['status']); ?></td>                            
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="7">لا توجد بيانات مدفوعات حتى الآن.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</body>
</html>