<?php
$iniPath = 'D:/Github/Utopya/Win32/Release/config.ini';
if (file_exists($iniPath)) {
    echo "=== CONFIG.INI ===\n" . file_get_contents($iniPath) . "\n";
}

$dbPath = 'D:/Github/Utopya/Win32/Release/DBUtopia.db';
if (file_exists($dbPath)) {
    $fp = fopen($dbPath, 'rb');
    $header = fread($fp, 64);
    fclose($fp);
    echo "=== DBUtopia.db HEADER (ASCII) ===\n" . substr($header, 0, 32) . "\n";
    echo "=== HEX ===\n" . bin2hex(substr($header, 0, 32)) . "\n";
}
