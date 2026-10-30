<?php
require_once __DIR__ . '/../backend/core/Response.php';
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

spl_autoload_register(function (string $class): void {
    foreach ([__DIR__ . '/../backend/controllers/', __DIR__ . '/../backend/models/', __DIR__ . '/../backend/middleware/', __DIR__ . '/../backend/helpers/', __DIR__ . '/../backend/core/'] as $dir) {
        $file = $dir . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

$pdo = Database::getInstance();
$stmt = $pdo->query("SELECT * FROM clinicsdoctors WHERE doctor_id = 'b481adaa-9da3-4893-91eb-2462510b4eb4'");
$cds = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Clinics doctors found: " . count($cds) . "\n";
foreach ($cds as $cd) {
    echo "Testing CD ID: {$cd['id']}\n";
    $_GET['clinics_doctor_id'] = $cd['id'];
    $_GET['date'] = '2026-10-28';
    try {
        AppointmentController::getAvailableSlots();
    } catch (Throwable $e) {
        echo "CAUGHT EXCEPTION: " . get_class($e) . ": " . $e->getMessage() . "\n";
        echo "Trace: " . $e->getTraceAsString() . "\n";
    }
}
