<?php
// ============================================================
// index.php  —  Tabibi REST API v2 (Fixed Router)
// ============================================================
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/config/database.php';

// Auto-load
spl_autoload_register(function (string $class): void {
    foreach ([__DIR__.'/controllers/', __DIR__.'/models/', __DIR__.'/middleware/', __DIR__.'/helpers/', __DIR__.'/core/'] as $dir) {
        $file = $dir . $class . '.php';
        if (file_exists($file)) { require_once $file; return; }
    }
});

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');
$uri    = preg_replace('#^/api#', '', $uri);  // strip /api prefix
$parts  = array_values(array_filter(explode('/', ltrim($uri, '/'))));

try {
    // ── Health ──────────────────────────────────────────────
    if ($uri === '/health' && $method === 'GET') {
        Response::success(['status' => 'ok', 'api' => 'Tabibi v2', 'time' => date('c')]);
    }

    // ── Auth ─────────────────────────────────────────────────
    if ($uri === '/auth/register' && $method === 'POST') { require_once __DIR__.'/controllers/AuthController.php'; AuthController::register(); }
    if ($uri === '/auth/login'    && $method === 'POST') { require_once __DIR__.'/controllers/AuthController.php'; AuthController::login(); }
    if ($uri === '/auth/logout'   && $method === 'POST') { require_once __DIR__.'/controllers/AuthController.php'; AuthController::logout(); }
    if ($uri === '/auth/me'       && $method === 'GET')  { require_once __DIR__.'/controllers/AuthController.php'; AuthController::me(); }

    // ── Verification ─────────────────────────────────────────
    if ($uri === '/verify/send'    && $method === 'POST') { require_once __DIR__.'/controllers/VerificationController.php'; VerificationController::send(); }
    if ($uri === '/verify/confirm' && $method === 'POST') { require_once __DIR__.'/controllers/VerificationController.php'; VerificationController::confirm(); }
    if ($uri === '/verify/status'  && $method === 'GET')  { require_once __DIR__.'/controllers/VerificationController.php'; VerificationController::status(); }

    // ── Patient ──────────────────────────────────────────────
    if ($uri === '/patients/profile'      && $method === 'GET')  { require_once __DIR__.'/controllers/PatientController.php'; PatientController::getProfile(); }
    if ($uri === '/patients/profile'      && $method === 'PUT')  { require_once __DIR__.'/controllers/PatientController.php'; PatientController::updateProfile(); }
    if ($uri === '/patients/appointments' && $method === 'GET')  { require_once __DIR__.'/controllers/PatientController.php'; PatientController::getAppointments(); }

    // ── Lookup ───────────────────────────────────────────────
    if ($uri === '/specialties' && $method === 'GET') { require_once __DIR__.'/controllers/ClinicController.php'; ClinicController::getSpecialties(); }
    if ($uri === '/wilayas'     && $method === 'GET') { require_once __DIR__.'/controllers/ClinicController.php'; ClinicController::getWilayas(); }

    // ── Clinics ───────────────────────────────────────────────
    if ($uri === '/clinics' && $method === 'GET') {
        require_once __DIR__.'/controllers/ClinicController.php'; ClinicController::search();
    }
    // /clinics/:id
    if (isset($parts[0]) && $parts[0] === 'clinics' && isset($parts[1]) && !isset($parts[2]) && $method === 'GET') {
        require_once __DIR__.'/controllers/ClinicController.php'; ClinicController::getClinic($parts[1]);
    }
    // /clinics/:cId/doctors/:dId
    if (isset($parts[0]) && $parts[0] === 'clinics' && isset($parts[3]) && ($parts[2] ?? '') === 'doctors' && $method === 'GET') {
        require_once __DIR__.'/controllers/ClinicController.php'; ClinicController::getDoctorAtClinic($parts[1], $parts[3]);
    }

    // ── Appointments ─────────────────────────────────────────
    if ($uri === '/appointments/available-slots' && $method === 'GET') {
        require_once __DIR__.'/controllers/AppointmentController.php'; AppointmentController::getAvailableSlots();
    }
    if ($uri === '/appointments' && $method === 'POST') {
        require_once __DIR__.'/controllers/AppointmentController.php'; AppointmentController::book();
    }
    if (isset($parts[0]) && $parts[0] === 'appointments' && isset($parts[1]) && !isset($parts[2])) {
        require_once __DIR__.'/controllers/AppointmentController.php';
        if ($method === 'GET')    AppointmentController::getOne($parts[1]);
        if ($method === 'DELETE') AppointmentController::cancel($parts[1]);
    }

    // ── Chat ─────────────────────────────────────────────────
    if ($uri === '/chat/threads' && $method === 'GET')  { require_once __DIR__.'/controllers/ChatController.php'; ChatController::getThreads(); }
    if ($uri === '/chat/threads' && $method === 'POST') { require_once __DIR__.'/controllers/ChatController.php'; ChatController::createThread(); }
    // /chat/threads/:id — get messages
    if (isset($parts[0]) && $parts[0]==='chat' && ($parts[1]??'')==='threads' && isset($parts[2]) && !isset($parts[3]) && $method==='GET') {
        require_once __DIR__.'/controllers/ChatController.php'; ChatController::getMessages($parts[2]);
    }
    // /chat/threads/:id/messages — send message
    if (isset($parts[0]) && $parts[0]==='chat' && ($parts[1]??'')==='threads' && isset($parts[3]) && $parts[3]==='messages' && $method==='POST') {
        require_once __DIR__.'/controllers/ChatController.php'; ChatController::sendMessage($parts[2]);
    }

    // ── Ratings ───────────────────────────────────────────────
    if ($uri === '/ratings' && $method === 'POST') { require_once __DIR__.'/controllers/RatingController.php'; RatingController::addRating(); }
    if (isset($parts[0]) && $parts[0]==='ratings' && ($parts[1]??'')==='doctor' && isset($parts[2]) && $method==='GET') {
        require_once __DIR__.'/controllers/RatingController.php'; RatingController::getDoctorRatings($parts[2]);
    }

    // ── Sync (مزامنة دلفي ↔ سيرفر) ──────────────────────────
    if ($uri === '/sync/upload'   && $method === 'POST') { require_once __DIR__.'/controllers/SyncController.php'; SyncController::upload(); }
    if ($uri === '/sync/download' && $method === 'GET')  { require_once __DIR__.'/controllers/SyncController.php'; SyncController::download(); }
    if ($uri === '/sync/delete'   && $method === 'POST') { require_once __DIR__.'/controllers/SyncController.php'; SyncController::delete(); }
    if ($uri === '/sync/status'   && $method === 'GET')  { require_once __DIR__.'/controllers/SyncController.php'; SyncController::status(); }
    if ($uri === '/sync/logs'     && $method === 'GET')  { require_once __DIR__.'/controllers/SyncController.php'; SyncController::logs(); }
    if ($uri === '/sync/reasons'  && $method === 'GET')  { require_once __DIR__.'/controllers/SyncController.php'; SyncController::reasons(); }

    // ── 404 ───────────────────────────────────────────────────
    Response::notFound("Route introuvable: $method $uri");

} catch (PDOException $e) {
    Response::serverError('Erreur base de données: ' . $e->getMessage());
} catch (Throwable $e) {
    Response::serverError('Erreur interne: ' . $e->getMessage());
}
