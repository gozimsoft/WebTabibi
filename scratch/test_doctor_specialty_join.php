<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$stmt = $pdo->query("SELECT d.id, d.fullname, d.specialtie_id, s.namear, s.namefr 
                     FROM doctors d 
                     LEFT JOIN specialties s ON d.specialtie_id = s.id 
                     WHERE d.fullname LIKE '%الدكتور%' 
                     LIMIT 10");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
