<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();

echo "=== DESCRIBE users ===\n";
$stmt = $pdo->query("DESCRIBE `users`");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== DESCRIBE doctors ===\n";
$stmt = $pdo->query("DESCRIBE `doctors`");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
