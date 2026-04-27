<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
echo "=== All tables ===\n";
foreach($pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_NUM) as $t) {
    echo $t[0] . "\n";
}

echo "\n=== Tables containing 'reason' ===\n";
foreach($pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_NUM) as $t) {
    if (stripos($t[0], 'reason') !== false) {
        echo "\n--- " . $t[0] . " ---\n";
        foreach($pdo->query("DESCRIBE " . $t[0])->fetchAll(PDO::FETCH_ASSOC) as $f) {
            echo "  " . $f['Field'] . " (" . $f['Type'] . ")\n";
        }
    }
}
