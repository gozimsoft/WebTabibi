<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Database.php';

header("Content-Type: application/json");
$pdo = Database::getInstance();

$docBaladiyas = $pdo->query("SELECT DISTINCT baladiya_id FROM doctors WHERE baladiya_id IS NOT NULL")->fetchAll(PDO::FETCH_COLUMN);
$patBaladiyas = $pdo->query("SELECT DISTINCT baladiya_id FROM patients WHERE baladiya_id IS NOT NULL")->fetchAll(PDO::FETCH_COLUMN);

$allUsed = array_unique(array_merge($docBaladiyas, $patBaladiyas));
$details = [];
if (!empty($allUsed)) {
    $placeholders = implode(',', array_fill(0, count($allUsed), '?'));
    $stmt = $pdo->prepare("SELECT id, namefr, namear FROM baladiyas WHERE id IN ($placeholders)");
    $stmt->execute($allUsed);
    $details = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode([
    'used_ids' => $allUsed,
    'details' => $details
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
