<?php
require 'backend/config/database.php';
require 'backend/core/Database.php';
$db = Database::getInstance();
$stmt = $db->query('SELECT id, doctor_id, clinic_id, clinic_id IS NULL as is_null, leave_type, start_datetime, end_datetime, show_reason_to_patient, reason FROM doctor_unavailabilities');
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    var_dump($r);
}
