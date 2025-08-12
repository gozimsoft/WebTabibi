<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // التحقق من إدخال اسم المشروع
    $projectName = filter_input(INPUT_POST, 'projectName', FILTER_SANITIZE_STRING);
    if (empty($projectName)) {
        die("يرجى إدخال اسم المشروع.");
    }

    // التحقق من وجود ملف مرفوع
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        die("تعذر رفع الملف. يرجى المحاولة مرة أخرى.");
    }

    // التحقق من نوع الملف
    $allowedTypes = ['application/octet-stream']; // النوع الشائع لملفات SQLite
    if (!in_array($_FILES['file']['type'], $allowedTypes)) {
        die("الملف المرفوع ليس قاعدة بيانات SQLite صالحة.");
    }

    // إنشاء مجلد لتحزين الملف
    $randomNumber = rand(1000, 9999);
    $folderName = $randomNumber . "_" . $projectName;
    $folderPath = __DIR__ . "/uploads/$folderName";

    if (!mkdir($folderPath, 0777, true)) {
        die("تعذر إنشاء المجلد لتخزين الملف.");
    }

    // نقل الملف المرفوع إلى المجلد
    $uploadedFilePath = $folderPath . "/" . basename($_FILES['file']['name']);
    if (!move_uploaded_file($_FILES['file']['tmp_name'], $uploadedFilePath)) {
        die("تعذر تخزين الملف المرفوع.");
    }
    // إنشاء ملف INI
    $iniFilePath = "$folderPath/config.ini";
    $iniContent = "
[Database]
path = $uploadedFilePath
state = 0

";
    if (file_put_contents($iniFilePath, $iniContent) === false) {
        die("تعذر إنشاء ملف INI.");
    }
    echo "تم رفع الملف بنجاح وتخزينه في المجلد: $folderName";
    echo "<br>يمكنك معالجة الملف لاحقًا.";
} else {
    die("طلب غير صالح.");
}

?>
