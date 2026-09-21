<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$pdo = Database::getInstance();

$stmt = $pdo->prepare("
    SELECT COUNT(u.id) 
    FROM users u
    LEFT JOIN patients p ON p.user_id = u.id
    LEFT JOIN doctors d ON d.user_id = u.id
    LEFT JOIN clinics c ON c.user_id = u.id
    WHERE 1=1
");
$stmt->execute();
echo "Direct count: " . $stmt->fetchColumn() . "\n";
