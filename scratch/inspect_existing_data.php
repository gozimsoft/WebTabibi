<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$tickets = $pdo->query("SELECT id, patient_id, doctor_id, clinic_id, subject, status FROM tickets")->fetchAll(PDO::FETCH_ASSOC);
echo "Existing Tickets (" . count($tickets) . "):\n";
print_r($tickets);

$messages = $pdo->query("SELECT id, ticket_id, sender_type, sender_id, message FROM ticketmessages")->fetchAll(PDO::FETCH_ASSOC);
echo "Existing Messages (" . count($messages) . "):\n";
print_r($messages);

$users = $pdo->query("SELECT id, username, usertype FROM users ORDER BY usertype ASC")->fetchAll(PDO::FETCH_ASSOC);
echo "Existing Users (" . count($users) . "):\n";
print_r($users);
