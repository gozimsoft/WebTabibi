<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$stmt = $pdo->query("SELECT * FROM tickets WHERE id = '4325e2b7-0dde-47a7-a609-c287608e7e8d'");
$ticket = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Ticket A:\n";
print_r($ticket);

$pat = $pdo->query("SELECT * FROM patients WHERE id = '{$ticket['patient_id']}'")->fetch(PDO::FETCH_ASSOC);
echo "Patient for Ticket A:\n";
print_r($pat);

$doc = $pdo->query("SELECT * FROM doctors WHERE id = '{$ticket['doctor_id']}'")->fetch(PDO::FETCH_ASSOC);
echo "Doctor for Ticket A:\n";
print_r($doc);

$tokenPatient = '6dfd4caa104e0f806f5cb6d2fb4ac0a529d9f134b002e745563274ea978cc688';
$sessPat = $pdo->query("SELECT s.*, u.username, u.usertype FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = '$tokenPatient'")->fetch(PDO::FETCH_ASSOC);
echo "Session for tokenPatient:\n";
print_r($sessPat);

$tokenDoc = '12fabe8d6f99643ae859f35075a393747f5796b813c1463fe5e98bc5b8706661';
$sessDoc = $pdo->query("SELECT s.*, u.username, u.usertype FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = '$tokenDoc'")->fetch(PDO::FETCH_ASSOC);
echo "Session for tokenDoc:\n";
print_r($sessDoc);
