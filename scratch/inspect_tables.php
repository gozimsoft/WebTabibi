<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
foreach (['patients', 'wilayas', 'baladiyas'] as $table) {
    echo "=== $table ===\n";
    $stmt = $pdo->query("DESCRIBE `$table`");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "{$row['Field']} | {$row['Type']} | {$row['Null']} | {$row['Key']}\n";
    }
}
