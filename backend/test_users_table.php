<?php
require 'core/Database.php';
$stmt = Database::getInstance()->query('SHOW CREATE TABLE Users');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
