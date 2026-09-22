<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$fks = $pdo->query("
    SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND (TABLE_NAME = 'baladiyas' OR REFERENCED_TABLE_NAME = 'baladiyas' OR TABLE_NAME = 'wilayas' OR REFERENCED_TABLE_NAME = 'wilayas')
")->fetchAll(PDO::FETCH_ASSOC);

print_r($fks);
