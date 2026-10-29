<?php
require 'backend/config/database.php';
require 'backend/core/Database.php';

$db = Database::getInstance();
$stmt = $db->query('SELECT * FROM doctor_unavailabilities ORDER BY created_at DESC LIMIT 10');
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Found " . count($rows) . " rows in doctor_unavailabilities:\n";
foreach ($rows as $r) {
    echo "ID: {$r['id']} | Doctor: {$r['doctor_id']} | Clinic: {$r['clinic_id']} | Type: {$r['leave_type']} | Start: {$r['start_datetime']} | End: {$r['end_datetime']} | Reason: {$r['reason']}\n";
}
