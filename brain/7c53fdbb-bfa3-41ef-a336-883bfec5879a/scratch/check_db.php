<?php
require_once __DIR__ . '/backend/core/Database.php';
require_once __DIR__ . '/backend/config/database.php';
try {
    $pdo = Database::getInstance();
    $stmt = $pdo->query("DESCRIBE apointements");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
