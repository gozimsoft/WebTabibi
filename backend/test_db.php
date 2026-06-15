<?php
require_once __DIR__ . '/core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query("DESCRIBE doctors");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
file_put_contents(__DIR__ . '/test_db_output.json', json_encode($columns, JSON_PRETTY_PRINT));
echo "Done";
