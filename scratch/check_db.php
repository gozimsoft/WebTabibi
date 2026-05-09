<?php
require_once __DIR__ . '/../backend/core/Database.php';
try {
    $pdo = Database::getInstance();
    $stmt = $pdo->query("DESCRIBE clinics");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Columns in clinics table:\n";
    foreach ($columns as $col) {
        echo "- " . $col['Field'] . " (" . $col['Type'] . ")\n";
    }

    echo "\nColumns in doctors table:\n";
    $stmt = $pdo->query("DESCRIBE doctors");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo "- " . $col['Field'] . " (" . $col['Type'] . ")\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
