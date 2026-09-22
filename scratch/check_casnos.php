<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "=== CASNOS DISTRIBUTION ===\n";
foreach ($pdo->query("SELECT casnos, COUNT(*) as c FROM doctors GROUP BY casnos")->fetchAll(PDO::FETCH_ASSOC) as $r) {
    echo var_export($r['casnos'], true) . ": " . $r['c'] . "\n";
}

echo "\n=== CNAS DISTRIBUTION ===\n";
foreach ($pdo->query("SELECT cnas, COUNT(*) as c FROM doctors GROUP BY cnas")->fetchAll(PDO::FETCH_ASSOC) as $r) {
    echo var_export($r['cnas'], true) . ": " . $r['c'] . "\n";
}

echo "\n=== SAMPLE IDENTIFIERS ===\n";
foreach ($pdo->query("SELECT id, fullname, rpps, numregister, nin FROM doctors WHERE rpps IS NOT NULL OR numregister IS NOT NULL OR nin IS NOT NULL LIMIT 5")->fetchAll(PDO::FETCH_ASSOC) as $r) {
    echo "{$r['fullname']} | RPPS: {$r['rpps']} | NumReg: {$r['numregister']} | NIN: {$r['nin']}\n";
}
