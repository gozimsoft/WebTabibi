<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$pdo = Database::getInstance();
$cols = $pdo->query('DESCRIBE doctors')->fetchAll(PDO::FETCH_COLUMN);
echo "Doctors table columns:\n" . implode(', ', $cols) . "\n";
