<?php
require_once __DIR__ . '/backend/core/Database.php';
// Do not require Response.php here if I want to mock it, but AppointmentController already requires it.
// So I'll just capture the output of the real Response class if I can, or I'll just look at the code.

// Let's just use the real classes but I'll try to find where it's failing.
require_once __DIR__ . '/backend/core/Response.php';
require_once __DIR__ . '/backend/controllers/AppointmentController.php';

$_GET['date'] = '2026-04-20';

echo "Testing getAvailableSlots...\n";
try {
    $pdo = Database::getInstance();
    $cd = $pdo->query("SELECT ID FROM ClinicsDoctors LIMIT 1")->fetchColumn();
    if ($cd) {
        $_GET['clinics_doctor_id'] = $cd;
        echo "Using ClinicsDoctor ID: $cd\n";
        
        // Use output buffering to catch the JSON response
        ob_start();
        AppointmentController::getAvailableSlots();
        $output = ob_get_clean();
        echo "Output: $output\n";
    } else {
        echo "No ClinicsDoctors found in DB\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
