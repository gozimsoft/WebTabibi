<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$deleted = $pdo->exec("DELETE FROM wilayas WHERE num > 58");
echo "Deleted $deleted pseudo-wilayas (num > 58) from wilayas table\n";

$remaining = $pdo->query("SELECT COUNT(*) FROM wilayas")->fetchColumn();
echo "Remaining official wilayas in wilayas table: $remaining\n";
