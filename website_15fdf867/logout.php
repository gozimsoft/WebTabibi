<?php
session_start();
session_unset(); // حذف جميع بيانات الجلسة
session_destroy(); // إنهاء الجلسة

// إعادة التوجيه إلى نافذة تسجيل الدخول
header("Location: login.php");
exit();
?>
