<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();

echo "--- TABLE STRUCTURE ---\n";
$stmt = $pdo->query("DESCRIBE specialties");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n--- CURRENT SPECIALTIES ROWS ---\n";
$stmt = $pdo->query("SELECT * FROM specialties");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
echo "\nTotal rows: " . count($rows) . "\n";
