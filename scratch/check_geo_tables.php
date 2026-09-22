<?php
require 'backend/core/Database.php';
$pdo = Database::getInstance();
foreach($pdo->query("SHOW TABLES LIKE '%baladiya%'") as $r) {
    echo $r[0] . PHP_EOL;
}
foreach($pdo->query("SHOW TABLES LIKE '%wilaya%'") as $r) {
    echo $r[0] . PHP_EOL;
}
foreach($pdo->query("SHOW TABLES LIKE '%commune%'") as $r) {
    echo $r[0] . PHP_EOL;
}
