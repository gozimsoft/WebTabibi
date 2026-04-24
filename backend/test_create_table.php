<?php
require 'core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query('SHOW CREATE TABLE ClinicsDoctors');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
