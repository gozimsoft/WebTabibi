<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "TABLES:\n" . implode("\n", $tables) . "\n\n";

foreach ($tables as $t) {
    if (stripos($t, 'ticket') !== false || stripos($t, 'message') !== false || stripos($t, 'chat') !== false) {
        echo "=== Columns in $t ===\n";
        $cols = $pdo->query("SHOW COLUMNS FROM `$t`")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cols as $c) {
            echo "  {$c['Field']} ({$c['Type']})\n";
        }
    }
}
