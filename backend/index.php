<?php
// ============================================================
// index.php  —  Tabibi REST API Entry Point
// ============================================================
declare(strict_types=1);

// CORS Headers — adjust origin in production
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/core/Response.php';

// Auto-load controllers
spl_autoload_register(function (string $class): void {
    $dirs = [
        __DIR__ . '/controllers/',
        __DIR__ . '/models/',
        __DIR__ . '/middleware/',
        __DIR__ . '/helpers/',
        __DIR__ . '/core/',
    ];
    foreach ($dirs as $dir) {
        $file = $dir . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Parse route
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');
$uri    = preg_replace('#^/api#', '', $uri);
$parts  = explode('/', ltrim($uri, '/'));

// ── Route Dispatcher ──────────────────────────────────────────
try {
    match (true) {

        // Auth
        $uri === '/auth/register' && $method === 'POST'
            => (require_once __DIR__.'/controllers/AuthController.php') && AuthController::register(),

        $uri === '/auth/login'    && $method === 'POST'
            => (require_once __DIR__.'/controllers/AuthController.php') && AuthController::login(),

        $uri === '/auth/logout'   && $method === 'POST'
            => (require_once __DIR__.'/controllers/AuthController.php') && AuthController::logout(),

        $uri === '/auth/me'       && $method === 'GET'
            => (require_once __DIR__.'/controllers/AuthController.php') && AuthController::me(),

        // Patient
        $uri === '/patients/profile' && $method === 'GET'
            => (require_once __DIR__.'/controllers/PatientController.php') && PatientController::getProfile(),

        $uri === '/patients/profile' && $method === 'PUT'
            => (require_once __DIR__.'/controllers/PatientController.php') && PatientController::updateProfile(),

        $uri === '/patients/appointments' && $method === 'GET'
            => (require_once __DIR__.'/controllers/PatientController.php') && PatientController::getAppointments(),

        // Specialties & Wilayas
        $uri === '/specialties' && $method === 'GET'
            => (require_once __DIR__.'/controllers/ClinicController.php') && ClinicController::getSpecialties(),

        $uri === '/wilayas' && $method === 'GET'
            => (require_once __DIR__.'/controllers/ClinicController.php') && ClinicController::getWilayas(),

        // Clinics search
        $uri === '/clinics' && $method === 'GET'
            => (require_once __DIR__.'/controllers/ClinicController.php') && ClinicController::search(),

        // Single clinic
        $parts[0] === 'clinics' && isset($parts[1]) && !isset($parts[2]) && $method === 'GET'
            => (require_once __DIR__.'/controllers/ClinicController.php') && ClinicController::getClinic($parts[1]),

        // Doctor at clinic
        $parts[0] === 'clinics' && isset($parts[3]) && $parts[2] === 'doctors' && $method === 'GET'
            => (require_once __DIR__.'/controllers/ClinicController.php')
               && ClinicController::getDoctorAtClinic($parts[1], $parts[3]),

        // Appointments
        $uri === '/appointments/available-slots' && $method === 'GET'
            => (require_once __DIR__.'/controllers/AppointmentController.php') && AppointmentController::getAvailableSlots(),

        $uri === '/appointments' && $method === 'POST'
            => (require_once __DIR__.'/controllers/AppointmentController.php') && AppointmentController::book(),

        $parts[0] === 'appointments' && isset($parts[1]) && $method === 'GET'
            => (require_once __DIR__.'/controllers/AppointmentController.php') && AppointmentController::getOne($parts[1]),

        $parts[0] === 'appointments' && isset($parts[1]) && $method === 'DELETE'
            => (require_once __DIR__.'/controllers/AppointmentController.php') && AppointmentController::cancel($parts[1]),

        // Chat
        $uri === '/chat/threads' && $method === 'GET'
            => (require_once __DIR__.'/controllers/ChatController.php') && ChatController::getThreads(),

        $uri === '/chat/threads' && $method === 'POST'
            => (require_once __DIR__.'/controllers/ChatController.php') && ChatController::createThread(),

        $parts[0] === 'chat' && $parts[1] === 'threads' && isset($parts[2]) && !isset($parts[3]) && $method === 'GET'
            => (require_once __DIR__.'/controllers/ChatController.php') && ChatController::getMessages($parts[2]),

        $parts[0] === 'chat' && $parts[1] === 'threads' && isset($parts[3]) && $parts[3] === 'messages' && $method === 'POST'
            => (require_once __DIR__.'/controllers/ChatController.php') && ChatController::sendMessage($parts[2]),

        // Ratings
        $uri === '/ratings' && $method === 'POST'
            => (require_once __DIR__.'/controllers/RatingController.php') && RatingController::addRating(),

        $parts[0] === 'ratings' && $parts[1] === 'doctor' && isset($parts[2]) && $method === 'GET'
            => (require_once __DIR__.'/controllers/RatingController.php') && RatingController::getDoctorRatings($parts[2]),

        // Health check
        $uri === '/health' && $method === 'GET'
            => Response::success(['status' => 'ok', 'api' => 'Tabibi v1.0']),

        // 404
        default => Response::notFound("Route non trouvée: $method $uri"),
    };
} catch (PDOException $e) {
    Response::serverError('Erreur base de données: ' . $e->getMessage());
} catch (Throwable $e) {
    Response::serverError('Erreur interne: ' . $e->getMessage());
}
