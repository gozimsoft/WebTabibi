<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$cols = $pdo->query("
    SELECT TABLE_NAME, COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME LIKE '%wilaya%'
")->fetchAll(PDO::FETCH_ASSOC);

print_r($cols);
