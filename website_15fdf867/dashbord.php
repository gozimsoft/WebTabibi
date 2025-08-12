<?php
session_start();
include 'database.php';

// التأكد من تسجيل الدخول
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit();
}

// الاتصال بقاعدة البيانات
$userId = $_SESSION['user_id'];

// معالجة زر "قبول" أو "رفض"
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $paymentId = $_POST['payment_id'];
    $action = $_POST['action'];

    if ($action === 'accept') {
        // جلب النقاط من جدول المدفوعات
        $stmt = $db->prepare("SELECT user_id, points FROM payments WHERE id = :id");
        $stmt->bindParam(':id', $paymentId);
        $stmt->execute();        
        
        $payment = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($payment) {
            // تحديث النقاط لحساب المستخدم
            $points = $payment['points'];
            $payment_User_id = $payment['user_id'];
            $updateUserStmt = $db->prepare("UPDATE users SET points = points + :points WHERE id = :user_id");
            $updateUserStmt->bindParam(':points', $points);
            $updateUserStmt->bindParam(':user_id', $payment_User_id);
            $updateUserStmt->execute();
            // تحديث حالة الدفع إلى "تم القبول"
            $updatePaymentStmt = $db->prepare("UPDATE payments SET status = 'تم القبول' WHERE id = :id");
            $updatePaymentStmt->bindParam(':id', $paymentId);
            $updatePaymentStmt->execute();
        }
    } elseif ($action === 'reject') {
        // تحديث حالة الدفع إلى "تم الرفض"
        $updatePaymentStmt = $db->prepare("UPDATE payments SET status = 'تم الرفض' WHERE id = :id");
        $updatePaymentStmt->bindParam(':id', $paymentId);
        $updatePaymentStmt->execute();
    }
}

// جلب المدفوعات
$stmt = $db->prepare("SELECT * FROM payments ORDER BY created_at DESC");
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
        }
        .container {
            max-width: 100% ;
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
        a, button {
            text-decoration: none;
            color: #fff;
            background-color: #007BFF;
            padding: 5px 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        a:hover, button:hover {
            background-color: #0056b3;
        }
        button.reject {
            background-color: #dc3545;
        }
        button.reject:hover {
            background-color: #c82333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>سجل المدفوعات</h2>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>الاسم</th>
                    <th>النقط</th>
                    <th>المبلغ</th>
                    <th>طريقة الدفع</th>
                    <th>سند الدفع</th>
                    <th>التاريخ</th>
                    <th>الحالة</th>
                    <th>قبول</th>
                    <th>رفض</th>
                </tr>
            </thead>
            <tbody>
                <?php if (count($payments) > 0): ?>
                    <?php foreach ($payments as $index => $payment): ?>
                        <tr>
                            <td><?php echo $index + 1; ?></td>
                            <td><?php echo htmlspecialchars($payment['username']); ?></td>
                            <td><?php echo htmlspecialchars($payment['points']); ?></td>
                            <td><?php echo htmlspecialchars($payment['amount']); ?></td>
                            <td><?php echo htmlspecialchars($payment['payment_method']); ?></td>
                            <td>
                                <a href="<?php echo htmlspecialchars($payment['receipt_path']); ?>" target="_blank">عرض السند</a>
                            </td>
                            <td><?php echo htmlspecialchars($payment['created_at']); ?></td>
                            <td><?php echo htmlspecialchars($payment['status']); ?></td>
                            <td>
                                <form method="POST" style="display:inline;">
                                    <input type="hidden" name="payment_id" value="<?php echo $payment['id']; ?>">
                                    <input type="hidden" name="action" value="accept">
                                    <button type="submit">قبول</button>
                                </form>
                            </td>
                            <td>
                                <form method="POST" style="display:inline;">
                                    <input type="hidden" name="payment_id" value="<?php echo $payment['id']; ?>">
                                    <input type="hidden" name="action" value="reject">
                                    <button type="submit" class="reject">رفض</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="9">لا توجد بيانات مدفوعات حتى الآن.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</body>
</html>
