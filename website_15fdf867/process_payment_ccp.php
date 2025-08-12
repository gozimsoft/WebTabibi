<?php
session_start();
include 'database.php';

// التأكد من تسجيل الدخول
if (!isset($_SESSION['username']) || !isset($_POST)) {
    header("Location: login.php");
    exit();
}

// إعدادات مجلد التخزين
$uploadDir = 'Payments/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true); // إنشاء المجلد إذا لم يكن موجودًا
}

// بيانات المستخدم
$username = $_SESSION['username'];
$userId = $_SESSION['user_id'] ?? 'unknown';
$amount = $_POST['amount'] ?? 0;
$points = $_POST['points'] ?? 0;
$paymentMethod = $_POST['payment_method'] ?? 'unknown';
$status = 'قيد المعالجة';


// الاتصال بقاعدة البيانات
try {
  
    // معالجة الملف المرفق
    if (isset($_FILES['receipt']) && $_FILES['receipt']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['receipt']['tmp_name'];
        $fileName = $_FILES['receipt']['name'];
        $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

        // تسمية الملف
        $newFileName = $username . '_' . $userId . '.' . $fileExtension;
        $destination = $uploadDir . $newFileName;

        // نقل الملف
        if (move_uploaded_file($fileTmpPath, $destination)) {
            // إدخال البيانات في جدول قاعدة البيانات
            $stmt = $db->prepare("INSERT INTO payments (username, user_id, amount, payment_method, receipt_path,status,points) 
            VALUES (:username, :user_id, :amount, :payment_method, :receipt_path,:status,:points)");
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':amount', $amount);
            $stmt->bindParam(':payment_method', $paymentMethod);                                 
            $stmt->bindParam(':receipt_path', $destination);       
            $stmt->bindParam(':status', $status);       
            $stmt->bindParam(':points', $points);
            $stmt->execute();          
            
            $stmt = $db->prepare("SELECT points FROM users WHERE id = :id");
            $stmt->bindParam(':id', $userId);
            $stmt->execute();
            header("Location: view_payments.php");
          //  echo "تم حفظ البيانات وتحميل السند بنجاح.";
        } else {
            echo "حدث خطأ أثناء تحميل الملف. يرجى المحاولة لاحقًا.";
        }
    } else {
        echo "لم يتم اختيار ملف أو حدث خطأ أثناء التحميل.";
    }

} catch (PDOException $e) {
    echo " فشل الاتصال بالخادم .. يرجى المحاولة لاحقا . : " . $e->getMessage();
}
?>
