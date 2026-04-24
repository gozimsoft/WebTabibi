<?php
require 'backend/core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query('DESCRIBE ClinicsDoctors');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
