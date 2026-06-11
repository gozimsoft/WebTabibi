<?php
require 'core/Database.php';

try {
    $pdo = Database::getInstance();
    
    $tables = ['patients', 'doctors', 'doctorregistrations'];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW COLUMNS FROM `$table` LIKE 'nin'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE `$table` ADD COLUMN `nin` VARCHAR(50) NULL");
            echo "Added `nin` to $table\n";
        } else {
            echo "`nin` already exists in $table\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
