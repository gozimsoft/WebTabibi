<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query("SELECT * FROM apointements ORDER BY updatedat DESC LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
