<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "=== DOCTORS TABLE ===\n";
foreach ($pdo->query("DESCRIBE doctors")->fetchAll(PDO::FETCH_ASSOC) as $col) {
    echo "{$col['Field']} ({$col['Type']}) Null:{$col['Null']} Key:{$col['Key']} Default:{$col['Default']}\n";
}

echo "\n=== CLINICSDOCTORS TABLE ===\n";
foreach ($pdo->query("DESCRIBE clinicsdoctors")->fetchAll(PDO::FETCH_ASSOC) as $col) {
    echo "{$col['Field']} ({$col['Type']}) Null:{$col['Null']} Key:{$col['Key']} Default:{$col['Default']}\n";
}

echo "\n=== SPECIALTIES TABLE ===\n";
foreach ($pdo->query("DESCRIBE specialties")->fetchAll(PDO::FETCH_ASSOC) as $col) {
    echo "{$col['Field']} ({$col['Type']}) Null:{$col['Null']} Key:{$col['Key']} Default:{$col['Default']}\n";
}
