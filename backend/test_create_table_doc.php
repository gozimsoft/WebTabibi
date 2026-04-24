<?php
require 'core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query('SHOW CREATE TABLE Doctors');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
