<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$res = $pdo->query("SELECT usertype, count(*) as c FROM users GROUP BY usertype")->fetchAll(PDO::FETCH_ASSOC);
print_r($res);
