<?php
require 'backend/core/Database.php';
$pdo = Database::getInstance();
echo "=== WILAYAS ===\n";
foreach($pdo->query('DESCRIBE wilayas') as $r) {
    echo $r['Field'] . ' (' . $r['Type'] . ')' . PHP_EOL;
}
echo "\n=== BALADIYAS ===\n";
foreach($pdo->query('DESCRIBE baladiyas') as $r) {
    echo $r['Field'] . ' (' . $r['Type'] . ')' . PHP_EOL;
}
