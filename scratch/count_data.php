<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$tCount = $pdo->query("SELECT COUNT(*) FROM tickets")->fetchColumn();
$mCount = $pdo->query("SELECT COUNT(*) FROM ticketmessages")->fetchColumn();
echo "TOTAL TICKETS: $tCount | TOTAL MESSAGES: $mCount\n";
