<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$row = $pdo->query("SHOW CREATE TABLE doctors")->fetch(PDO::FETCH_ASSOC);
echo $row['Create Table'] . "\n";
