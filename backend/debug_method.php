<?php
// ================================================================
// debug_method.php — التحقق من وجود الدالة على الاستضافة (احذفه بعد الاختبار!)
// الاستخدام: https://tabibi.dz/api/debug_method.php
// ================================================================
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/controllers/AppointmentController.php';

echo json_encode([
    'method_exists' => method_exists('AppointmentController', 'getDoctorAppointments'),
    'class_exists' => class_exists('AppointmentController'),
    'methods_list' => get_class_methods('AppointmentController')
], JSON_PRETTY_PRINT);
