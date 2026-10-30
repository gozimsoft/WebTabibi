<?php
$cdId = $argv[1] ?? '';
$date = $argv[2] ?? '';

$_GET['clinics_doctor_id'] = $cdId;
$_GET['date'] = $date;

require_once __DIR__ . '/../backend/controllers/AppointmentController.php';
AppointmentController::getAvailableSlots();
