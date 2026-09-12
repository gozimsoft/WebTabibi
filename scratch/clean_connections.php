<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$my_id = $pdo->query("SELECT CONNECTION_ID()")->fetchColumn();
$stmt = $pdo->query("SHOW PROCESSLIST");
$procs = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($procs as $p) {
    if ($p['Id'] != $my_id && $p['User'] === 'uyyuppcc_admin' && $p['Time'] > 5) {
        try {
            $pdo->exec("KILL {$p['Id']}");
            echo "Killed hanging connection {$p['Id']}\n";
        } catch (Exception $e) {}
    }
}
echo "Checked process list.\n";
