<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$stmt = $pdo->query("SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
                     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                     WHERE REFERENCED_TABLE_NAME = 'specialties' AND TABLE_SCHEMA = 'uyyuppcc_DBTabibi'");
$fks = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "=== FOREIGN KEYS REFERENCING specialties ===\n";
print_r($fks);
