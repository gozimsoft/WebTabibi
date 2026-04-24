<?php
require 'core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query('SELECT * FROM ClinicRegistrations');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
