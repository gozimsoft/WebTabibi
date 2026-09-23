<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$pdo = Database::getInstance();

foreach (['notifications', 'tickets', 'ticketsmessages', 'sessions', 'users'] as $table) {
    try {
        $stmt = $pdo->query("SELECT 1 FROM `$table` LIMIT 1");
        echo "Table `$table`: OK\n";
    } catch (Exception $e) {
        echo "Table `$table`: FAILED -> " . $e->getMessage() . "\n";
    }
}
