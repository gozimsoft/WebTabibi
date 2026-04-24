<?php
require 'core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->prepare('SELECT ID, Specialtie_id FROM Doctors LIMIT 5');
$stmt->execute();
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
