<?php
$targetDir = 'D:/Github/Utopia_react';
if (!is_dir($targetDir)) {
    if (mkdir($targetDir, 0777, true)) {
        echo "Created folder: $targetDir\n";
    } else {
        echo "Failed to create folder: $targetDir\n";
    }
} else {
    echo "Folder already exists: $targetDir\n";
}
