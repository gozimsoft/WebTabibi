<?php
require 'backend/core/Database.php';
$pdo = Database::getInstance();
foreach($pdo->query("SELECT s.created_at, u.username, u.usertype FROM sessions s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC LIMIT 5") as $r) {
    echo $r["username"]." (type: ".$r["usertype"].") ".$r["created_at"].PHP_EOL;
}
