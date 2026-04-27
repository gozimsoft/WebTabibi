<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query("DESCRIBE doctorsreasons");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
