<?php
session_start();

// التأكد من أن المستخدم مسجل دخول
if (!isset($_SESSION['username']) || !isset($_GET['amount'])) {
    header("Location: login.php");
    exit();
}

// الحصول على البيانات المطلوبة
$username = $_SESSION['username'];
$amount = $_GET['amount'];
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
    <title>الدفع عبر PayPal</title>
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f9f9f9;
        }

        .container {
            text-align: center;
            padding: 30px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 500px;
        }

        h2 {
            margin-bottom: 20px;
            font-size: 24px;
            color: #333;
        }

        .paypal-button {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    </style>
    <!-- رابط مكتبة PayPal -->
    <script src="https://www.paypal.com/sdk/js?client-id=Aas1xpkWEp7cpZw50_VRoAdsKrD-EfmR0yJK2lIKSY-lHw6-534XBR1NLcHlifGAYyfhBCSIrHtL3WFF&currency=USD"></script>
</head>
<body>
    <div class="container">        
        <div class="paypal-button">
            <script>
                // استدعاء نافذة الدفع مباشرة عند تحميل الصفحة
                paypal.Buttons({
                    createOrder: function(data, actions) {
                        // إنشاء طلب الدفع
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: <?php echo $amount; ?> // المبلغ المطلوب دفعه بالدولار
                                }
                            }]
                        });
                    },
                    onApprove: function(data, actions) {
                        // تنفيذ الدفع عند موافقة المستخدم
                        return actions.order.capture().then(function(details) {
                            // إرسال البيانات عبر POST فور نجاح الدفع
                            // alert('تم الدفع بنجاح .');
                            document.getElementById("paymentForm").submit();        
                            alert('تم الدفع بنجاح .');
                        });
                    },
                    onCancel: function(data) {
                        // في حالة إلغاء عملية الدفع                                 
                        alert('تم إلغاء عملية الدفع.');                      
                    },
                    onError: function(err) {
                        // في حالة حدوث خطأ
                       alert('حدث خطأ أثناء الدفع. يرجى المحاولة لاحقًا.');
                    }
                }).render('.paypal-button'); // عرض الزر في العنصر المحدد
            </script>
        </div>
    </div>

    <!-- نموذج إرسال البيانات عبر POST -->
    <form id="paymentForm" action="success_payment_paypal.php" method="POST" style="display:none;">
        <input type="hidden" name="username" value="<?php echo htmlspecialchars($username); ?>">
        <input type="hidden" name="userId" value="<?php echo htmlspecialchars($userId); ?>">
        <input type="hidden" name="points" value="<?php echo htmlspecialchars($points); ?>">
        <input type="hidden" name="amount" value="<?php echo htmlspecialchars($amount); ?>">
    </form>
</body>
</html>
