<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$pdo->exec("DELETE FROM baladiyas WHERE id = '54ed5d03-f9cc-462a-a9d4-892d29bf59f7'");
echo "Deleted duplicate Tabelbala from Wilaya 52\n";
