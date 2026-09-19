<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "=== TABLE: tickets ===\n";
$cols = $pdo->query("DESCRIBE tickets")->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols as $c) {
    echo "{$c['Field']} | {$c['Type']} | Null: {$c['Null']} | Default: {$c['Default']}\n";
}

echo "\n=== TABLE: ticketmessages ===\n";
$cols2 = $pdo->query("DESCRIBE ticketmessages")->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols2 as $c) {
    echo "{$c['Field']} | {$c['Type']} | Null: {$c['Null']} | Default: {$c['Default']}\n";
}
