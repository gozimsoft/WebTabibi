<?php
require_once 'D:/Github/Utopia_react/backend/src/config/db.js';
// Or query directly using PDO:
$pdo = new PDO('mysql:host=127.0.0.1;dbname=utopia_db;charset=utf8mb4', 'root', '');
$stmt = $pdo->query("SELECT * FROM InvoicesVentes ORDER BY ID DESC LIMIT 15");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT);
