<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$tables = $pdo->query("SHOW TABLES LIKE '%sync%'")->fetchAll(PDO::FETCH_COLUMN);
echo "Sync tables: " . implode(', ', $tables) . "\n";

// Check health endpoint
echo "\nChecking health endpoint in backend/index.php...\n";
$healthCode = 0;
$ch = curl_init('http://localhost:81/api/health');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
$healthCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "GET /api/health: $healthCode => $res\n";
