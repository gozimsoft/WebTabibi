<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
echo "Users count: " . $pdo->query("SELECT count(*) FROM users")->fetchColumn() . "\n";
echo "Doctors count: " . $pdo->query("SELECT count(*) FROM doctors")->fetchColumn() . "\n";
