<?php
require 'backend/config/database.php';
require 'backend/core/Database.php';

$db = Database::getInstance();
$stmt = $db->query("SELECT * FROM doctor_unavailabilities WHERE id = '457ee3ae-eee0-4024-9c10-2168abb0575b'");
$row = $stmt->fetch(PDO::FETCH_ASSOC);

var_dump($row);
