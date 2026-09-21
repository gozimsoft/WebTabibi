<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$docs = $pdo->query("SELECT fullname FROM doctors WHERE fullname IS NOT NULL AND fullname != '' LIMIT 10")->fetchAll(PDO::FETCH_COLUMN);
print_r($docs);
