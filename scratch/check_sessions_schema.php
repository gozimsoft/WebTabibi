<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();

echo "=== SESSIONS COLUMNS ===\n";
$cols = $pdo->query("DESCRIBE sessions")->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols as $c) {
    echo $c['Field'] . " (" . $c['Type'] . ") Null:" . $c['Null'] . " Key:" . $c['Key'] . "\n";
}

echo "\n=== USERS COLUMNS ===\n";
$colsU = $pdo->query("DESCRIBE users")->fetchAll(PDO::FETCH_ASSOC);
foreach ($colsU as $c) {
    echo $c['Field'] . " (" . $c['Type'] . ") Null:" . $c['Null'] . " Key:" . $c['Key'] . "\n";
}

echo "\n=== MATCHING TABLES ===\n";
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $t) {
    if (stripos($t, 'log') !== false || stripos($t, 'audit') !== false || stripos($t, 'session') !== false || stripos($t, 'sync') !== false) {
        echo $t . "\n";
    }
}
