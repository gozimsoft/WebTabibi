<?php
// migrate_notifications.php
require_once __DIR__ . '/core/Database.php';

try {
    $pdo = Database::getInstance();
    $sql = file_get_contents(__DIR__ . '/sql/create_notifications_table.sql');
    $pdo->exec($sql);
    echo "SUCCESS: notifications table created or already exists.\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
