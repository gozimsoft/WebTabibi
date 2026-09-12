<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$my_id = $pdo->query("SELECT CONNECTION_ID()")->fetchColumn();
echo "My Connection ID: $my_id\n";

$stmt = $pdo->query("SHOW PROCESSLIST");
$procs = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "=== CURRENT ACTIVE CONNECTIONS ===\n";
foreach ($procs as $p) {
    echo "ID: {$p['Id']} | User: {$p['User']} | Host: {$p['Host']} | DB: {$p['db']} | Command: {$p['Command']} | Time: {$p['Time']} | Info: {$p['Info']}\n";
    if ($p['Id'] != $my_id && $p['User'] === 'uyyuppcc_admin' && $p['Time'] > 20) {
        try {
            $pdo->exec("KILL {$p['Id']}");
            echo "  -> Killed hanging connection {$p['Id']}\n";
        } catch (Exception $e) {
            echo "  -> Could not kill {$p['Id']}: " . $e->getMessage() . "\n";
        }
    }
}
