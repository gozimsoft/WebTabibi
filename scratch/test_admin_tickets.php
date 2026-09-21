<?php
require_once __DIR__ . '/../backend/core/Database.php';

$token = '3000bd9344cbe5406c7e028d4abd0e21a034f7f487c99ff8ff5703e90c07a824';
$ch = curl_init('http://localhost:81/api/tickets');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
$r = curl_exec($ch);
$c = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "HTTP $c => $r\n";
