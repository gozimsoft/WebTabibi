<?php
session_start();
// التأكد من تسجيل الدخول
if (!isset($_SESSION['username']) || !isset($_POST)) {
    header("Location: index.php");
    exit();
}
 
include 'database.php';
 

// استقبال البيانات عبر POST
$username = $_POST['username'] ?? 'unknown';
$userId = $_POST['userId'] ?? 'unknown';
$points = $_POST['points'] ?? 0;
$amount = $_POST['amount'] ?? 0;
$paymentMethod =  'paypal';
$status = 'تم القبول';

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

// تحديث النقاط لحساب المستخدم
$updateUserStmt = $db->prepare("UPDATE users SET points = points + :points WHERE id = :user_id");
$updateUserStmt->bindParam(':points', $points);
$updateUserStmt->bindParam(':user_id', $userId);
$updateUserStmt->execute();

header("Location: index.php");


?>