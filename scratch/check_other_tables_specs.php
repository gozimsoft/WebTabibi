<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "=== REASONS TABLE SPECIALTY IDS ===\n";
$stmt = $pdo->query("SELECT specialtie_id, count(*) as cnt FROM reasons GROUP BY specialtie_id");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "=== CLINICSDOCTORS TABLE SPECIALTY IDS ===\n";
$stmt = $pdo->query("SELECT specialtie_id, count(*) as cnt FROM clinicsdoctors GROUP BY specialtie_id");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
