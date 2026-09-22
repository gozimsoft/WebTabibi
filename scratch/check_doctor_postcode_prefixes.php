<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$stmt = $pdo->query("
    SELECT FLOOR(postcode / 1000) as p_prefix, COUNT(*) as cnt
    FROM doctors
    WHERE postcode IS NOT NULL AND FLOOR(postcode / 1000) > 58
    GROUP BY p_prefix
    ORDER BY p_prefix
");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
