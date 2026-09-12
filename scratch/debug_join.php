<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();

echo "Sample doctors specialtie_id:\n";
$stmt = $pdo->query("SELECT id, fullname, HEX(specialtie_id) as h_sid, specialtie_id FROM doctors LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "Sample specialties id:\n";
$stmt = $pdo->query("SELECT id, HEX(id) as h_id, namear, namefr FROM specialties LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "Direct join test:\n";
$stmt = $pdo->query("SELECT d.fullname, s.namear FROM doctors d JOIN specialties s ON d.specialtie_id = s.id LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
