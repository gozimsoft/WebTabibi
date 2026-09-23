<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$pdo = Database::getInstance();
$docs = $pdo->query('SELECT id, fullname, address, latitude, longitude FROM doctors WHERE status = "APPROVED" LIMIT 3')->fetchAll(PDO::FETCH_ASSOC);
print_r($docs);
