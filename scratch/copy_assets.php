<?php
$sourceIcons = 'D:/Github/Utopya/Icons';
$sourceImages = 'D:/Github/Utopya/Images';
$targetDir = 'D:/Github/Utopia_react/assets';

function copyDir($src, $dst) {
    if (!is_dir($dst)) @mkdir($dst, 0777, true);
    $dir = opendir($src);
    while (false !== ($file = readdir($dir))) {
        if ($file != '.' && $file != '..') {
            if (is_dir($src . '/' . $file)) {
                copyDir($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

if (is_dir($sourceIcons)) {
    copyDir($sourceIcons, "$targetDir/icons");
    echo "Copied Icons to $targetDir/icons\n";
}
if (is_dir($sourceImages)) {
    copyDir($sourceImages, "$targetDir/images");
    echo "Copied Images to $targetDir/images\n";
}

// Also copy sqlite DB as reference
copy('D:/Github/Utopya/Win32/Release/DBUtopia.db', 'D:/Github/Utopia_react/database/DBUtopia.db');
echo "Copied DBUtopia.db to D:/Github/Utopia_react/database/DBUtopia.db\n";

// Copy Lang.ini
if (file_exists('D:/Github/Utopya/Lang/Lang.ini')) {
    copy('D:/Github/Utopya/Lang/Lang.ini', 'D:/Github/Utopia_react/database/Lang.ini');
    echo "Copied Lang.ini\n";
}
