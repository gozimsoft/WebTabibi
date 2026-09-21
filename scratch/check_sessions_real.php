<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$uidPat = '96053843-d218-4a99-b11e-72bc09952c6c';
$uidDoc = 'bad85bc4-b8c4-41c7-aeb6-bbde8eadce74';

$sPat = $pdo->query("SELECT * FROM sessions WHERE user_id = '$uidPat'")->fetchAll(PDO::FETCH_ASSOC);
echo "Sessions for Ticket A Patient ($uidPat):\n";
print_r($sPat);

$sDoc = $pdo->query("SELECT * FROM sessions WHERE user_id = '$uidDoc'")->fetchAll(PDO::FETCH_ASSOC);
echo "Sessions for Ticket A Doctor ($uidDoc):\n";
print_r($sDoc);
