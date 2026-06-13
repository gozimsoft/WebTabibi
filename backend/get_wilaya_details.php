<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Database.php';

header("Content-Type: application/json");
$pdo = Database::getInstance();

$wilayas = $pdo->query("SELECT id, num, namefr, namear FROM wilayas WHERE num IN (16, 28, 31)")->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($wilayas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
