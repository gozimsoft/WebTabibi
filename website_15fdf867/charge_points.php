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
    <link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="myicon.png">
    <title>حساب النقاط</title>
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            text-align: center;
            margin: 0 auto;
            padding: 50px;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 400px;
            margin: 0px auto;
            padding: 10px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        input[type="number"], select, button {
            font-family: 'Cairo', sans-serif;
            padding: 5px 0px;
            margin: 5px  auto;
            border: 1px solid #ccc;
            border-radius: 5px;
            width: 100%;
        }
        button {
            background-color: #007BFF;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            border: none;
            font-family: 'Cairo', sans-serif;
        }
        button:hover {
            background-color: #0056b3;
        }
        .result {
            font-weight: bold;
            margin-top: 10px;
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

<script>
        function calculateAmount() {
            const points = document.getElementById("points").value; // قراءة عدد النقاط
            const amount = points * 5; // حساب المبلغ
            document.getElementById("amount").innerText = points > 0 ? `المبلغ الواجب دفعه: ${amount} دولار` : ''; // تحديث النص
            const input = document.getElementById("points");
            // إذا كان الرقم يحتوي على كسور، يتم تحويله إلى عدد صحيح
            input.value = Math.max(1, Math.floor(input.value));
     
        }
        function processPayment(event) {
            event.preventDefault(); // منع الإرسال الافتراضي للنموذج
            const points = document.getElementById("points").value; // عدد النقاط
            const paymentMethod = document.getElementById("payment_method").value; // طريقة الدفع

            if (!points || points <= 0) {
                alert("يرجى إدخال عدد النقاط بشكل صحيح.");
                return;
            }
            const amount = points * 5; // حساب المبلغ
            let redirectUrl;
            switch (paymentMethod) {
                case "paypal":
                    redirectUrl = "payment_paypal.php";
                    break;
                case "baridimob":
                    redirectUrl = "payment_baridimob.php";
                    break;
                default:
                    alert("يرجى اختيار طريقة دفع.");
                    return;
            }
            // إعادة التوجيه إلى صفحة الدفع مع إرسال المبلغ
            window.location.href = `${redirectUrl}?amount=${amount}&points=${points}`;
        }

     
      
    </script>


</head>
<body>
    <div class="container">
     <a href="index.php">العودة إلى الصفحة الرئيسية</a>
     <h2>رصيدك الحالي : <?php echo $_SESSION['points']  ?> نقطة .</h2>   
    <hr>
     <h2>1 نقطة = 5 دولار</h2>
        <h3>المشروع الواحد = 0.9 نقطة </h3>            
         
            <form onsubmit="processPayment(event)">
            <label for="points">أدخل عدد النقاط:</label>
            <input type="number" id="points" name="points" min="1" oninput="calculateAmount()" required>     
            <div class="result" id="amount"></div> <!-- يتم تحديث هذا النص ديناميكيًا -->                        
            <select id="payment_method" name="payment_method" required>
                <option value="" disabled selected>اختر طريقة الدفع</option>
                <option value="paypal">Paypal</option>
                <option value="baridimob">Baridi mob</option>        
            </select>            
            <button type="submit">الدفع</button>
        </form>
    </div>
</body>


</html>
