<?php
require 'core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query('SELECT * FROM ClinicsDoctors');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
