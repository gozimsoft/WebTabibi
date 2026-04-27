<?php
require_once 'c:/xampp/htdocs/WebTabibi/backend/core/Database.php';
try {
    $pdo = Database::getInstance();
    $stmt = $pdo->query("DESCRIBE patients");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
