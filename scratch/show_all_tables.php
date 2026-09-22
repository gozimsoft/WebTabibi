<?php
require 'backend/core/Database.php';
$pdo = Database::getInstance();
foreach($pdo->query("SHOW TABLES") as $r) {
    echo array_values($r)[0] . PHP_EOL;
}
