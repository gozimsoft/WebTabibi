<?php
$parentDir = __DIR__ . '/uploads'; // المجلد الرئيسي الذي يحتوي على المجلدات الفرعية
$excludedFolder = 'filesconst'; // اسم المجلد الذي لا يجب حذفه
$thresholdTime = time() - (24 * 60 * 60); // حساب وقت 24 ساعة مضت

// التحقق مما إذا كان المجلد موجودًا
if (!is_dir($parentDir)) {
    die("المجلد 'uploads' غير موجود.\n");
}

// البحث عن جميع المجلدات داخل uploads
$folders = array_filter(glob($parentDir . '/*'), 'is_dir');

foreach ($folders as $folder) {
    $folderName = basename($folder);
    
    // تخطي المجلد المستثنى
    if ($folderName === $excludedFolder) {
        continue;
    }

    // الحصول على وقت الإنشاء
    $folderCreationTime = filemtime($folder);

    // حذف المجلدات التي مر عليها أكثر من يوم
    if ($folderCreationTime < $thresholdTime) {
        deleteFolder($folder);
        echo "تم حذف المجلد: $folder\n";
    }
}

/**
 * دالة لحذف المجلد بكافة محتوياته
 */
function deleteFolder($folderPath) {
    $files = array_diff(scandir($folderPath), array('.', '..'));
    foreach ($files as $file) {
        $filePath = "$folderPath/$file";
        is_dir($filePath) ? deleteFolder($filePath) : unlink($filePath);
    }
    rmdir($folderPath);
}
?>
