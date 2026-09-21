<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();
$tickets = $pdo->query("SELECT t.id, t.patient_id, t.doctor_id, t.clinic_id, t.subject, t.status, p.user_id as pat_uid, d.user_id as doc_uid FROM tickets t LEFT JOIN patients p ON p.id = t.patient_id LEFT JOIN doctors d ON d.id = t.doctor_id")->fetchAll(PDO::FETCH_ASSOC);
echo "Tickets in DB:\n";
print_r($tickets);
