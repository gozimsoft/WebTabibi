<?php
require_once __DIR__ . '/backend/core/Database.php';
require_once __DIR__ . '/backend/controllers/AppointmentController.php';

// Mock Response class to see output
class Response {
    public static function success($data, $msg = '', $code = 200) {
        echo json_encode(['success' => true, 'data' => $data, 'message' => $msg]);
    }
    public static function error($msg, $code = 400) {
        echo json_encode(['success' => false, 'message' => $msg]);
    }
    public static function notFound($msg = 'Not found') {
        echo json_encode(['success' => false, 'message' => $msg]);
    }
}

$_GET['clinics_doctor_id'] = '663360D4-306A-47C8-97F7-AF31C618BB9A'; // I need a real ID or I'll just see "not found"
$_GET['date'] = '2026-04-20';

echo "Testing getAvailableSlots...\n";
try {
    // I need to find a real ID first
    $pdo = Database::getInstance();
    $cd = $pdo->query("SELECT ID FROM ClinicsDoctors LIMIT 1")->fetchColumn();
    if ($cd) {
        $_GET['clinics_doctor_id'] = $cd;
        echo "Using ClinicsDoctor ID: $cd\n";
        AppointmentController::getAvailableSlots();
    } else {
        echo "No ClinicsDoctors found in DB\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
