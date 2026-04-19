<?php
require_once __DIR__ . '/backend/core/Database.php';
$pdo = Database::getInstance();
$table = 'Doctors';
echo "Describing table $table:\n";
try {
    $stmt = $pdo->query("DESCRIBE $table");
    while ($row = $stmt->fetch()) {
        echo "{$row['Field']} | {$row['Type']} | {$row['Null']} | {$row['Key']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
