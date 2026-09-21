<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$uidPatB = '7c759d2d-b249-4767-97a3-601f41b5b42b';
$uidDocB = '2b780a1b-de0a-4170-9fc1-191ac174d4ad';

$sPat = $pdo->query("SELECT * FROM sessions WHERE user_id = '$uidPatB'")->fetchAll(PDO::FETCH_ASSOC);
echo "Sessions for Ticket B Patient ($uidPatB):\n";
print_r($sPat);

$sDoc = $pdo->query("SELECT * FROM sessions WHERE user_id = '$uidDocB'")->fetchAll(PDO::FETCH_ASSOC);
echo "Sessions for Ticket B Doctor ($uidDocB):\n";
print_r($sDoc);
