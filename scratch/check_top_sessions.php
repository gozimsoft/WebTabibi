<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query('SELECT s.token, s.created_at, u.id, u.username, u.usertype FROM sessions s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC LIMIT 5');
while($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $r['username'].' | usertype='.$r['usertype'].' | token='.$r['token'].' | created='.$r['created_at'].PHP_EOL;
}
