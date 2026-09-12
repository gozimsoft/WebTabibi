<?php
require_once __DIR__ . '/../backend/config/Database.php';

$pdo = new PDO(
    sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET),
    DB_USER, DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$stmt = $pdo->query("SELECT id, name, namear FROM reasons WHERE specialtie_id = 'da195033-5b58-11f0-9c01-525400088b55' ORDER BY id LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
