<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Database.php';

header("Content-Type: application/json");
$pdo = Database::getInstance();

$rows = $pdo->query("SELECT d.fullname, b.namefr, b.namear, d.postcode FROM doctors d JOIN baladiyas b ON b.id = d.baladiya_id")->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
