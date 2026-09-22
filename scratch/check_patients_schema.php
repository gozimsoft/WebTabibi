<?php
require 'backend/core/Database.php';
$pdo = Database::getInstance();
foreach($pdo->query('DESCRIBE patients') as $r) {
    echo $r['Field'] . ' (' . $r['Type'] . ')' . PHP_EOL;
}
