<?php
require_once __DIR__ . '/../backend/core/Response.php';
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

spl_autoload_register(function ($c) {
    foreach ([__DIR__ . '/../backend/controllers/', __DIR__ . '/../backend/models/', __DIR__ . '/../backend/middleware/', __DIR__ . '/../backend/helpers/', __DIR__ . '/../backend/core/'] as $d) {
        if (file_exists($d . $c . '.php')) {
            require_once $d . $c . '.php';
            return;
        }
    }
});

ob_start();
ClinicController::getDoctorPublicProfile('b481adaa-9da3-4893-91eb-2462510b4eb4');
$out = ob_get_clean();
$json = json_decode($out, true);
echo "Doctor: " . ($json['data']['fullname'] ?? 'N/A') . PHP_EOL;
echo "Unavailabilities count: " . count($json['data']['unavailabilities'] ?? []) . PHP_EOL;
if (!empty($json['data']['unavailabilities'])) {
    foreach ($json['data']['unavailabilities'] as $u) {
        echo " - [{$u['leave_type']}] from {$u['start_datetime']} to {$u['end_datetime']} (Reason: {$u['reason']})\n";
    }
}
