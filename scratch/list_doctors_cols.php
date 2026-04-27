<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query("DESCRIBE doctors");
foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
    echo $r['Field'] . " - " . $r['Type'] . "\n";
}
