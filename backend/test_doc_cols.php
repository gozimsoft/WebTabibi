<?php
require 'core/Database.php';
$stmt = Database::getInstance()->query('SHOW COLUMNS FROM Doctors');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
