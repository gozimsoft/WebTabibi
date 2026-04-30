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
    foreach ([__DIR__ . '/controllers/', __DIR__ . '/models/', __DIR__ . '/middleware/', __DIR__ . '/helpers/', __DIR__ . '/core/'] as $dir) {
        $file = $dir . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
$uri = preg_replace('#^/api#', '', $uri);  // strip /api prefix
$parts = array_values(array_filter(explode('/', ltrim($uri, '/'))));

try {
    // ── Health & Debug ──────────────────────────────────────
    if ($uri === '/health' && $method === 'GET') {
        Response::success(['status' => 'ok', 'api' => 'Tabibi v2', 'time' => date('c')]);
    }
    if ($uri === '/debug-email' && $method === 'GET') {
        require_once __DIR__ . '/helpers/EmailHelper.php';
        $pdo = Database::getInstance();
        $patient = $pdo->query("SELECT p.fullname, u.email FROM patients p JOIN users u ON u.id = p.user_id WHERE u.email != '' LIMIT 1")->fetch();
        if (!$patient) Response::error("Aucun patient avec email trouvé pour le test", 404);
        $ok = EmailHelper::sendAppointmentConfirmation($patient['email'], $patient['fullname'], 'Dr. Test', 'Clinique Test', date('Y-m-d H:i:s'), 'Test Diagnostic');
        Response::success(['email_sent' => $ok, 'to' => $patient['email']]);
    }

    // ── Auth ─────────────────────────────────────────────────
    if ($uri === '/auth/register' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::register();
    }
    if ($uri === '/auth/login' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::login();
    }
    if ($uri === '/auth/logout' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::logout();
    }
    if ($uri === '/auth/me' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::me();
    }

    // ── Verification ─────────────────────────────────────────
    if ($uri === '/verify/send' && $method === 'POST') {
        require_once __DIR__ . '/controllers/VerificationController.php';
        VerificationController::send();
    }
    if ($uri === '/verify/confirm' && $method === 'POST') {
        require_once __DIR__ . '/controllers/VerificationController.php';
        VerificationController::confirm();
    }
    if ($uri === '/verify/status' && $method === 'GET') {
        require_once __DIR__ . '/controllers/VerificationController.php';
        VerificationController::status();
    }

    // ── Patient ──────────────────────────────────────────────
    if ($uri === '/patients/profile' && $method === 'GET') {
        require_once __DIR__ . '/controllers/PatientController.php';
        PatientController::getProfile();
    }
    if ($uri === '/patients/profile' && $method === 'PUT') {
        require_once __DIR__ . '/controllers/PatientController.php';
        PatientController::updateProfile();
    }
    if ($uri === '/patients/appointments' && $method === 'GET') {
        require_once __DIR__ . '/controllers/PatientController.php';
        PatientController::getAppointments();
    }

    // ── Doctor ───────────────────────────────────────────────
    if ($uri === '/doctors/profile' && $method === 'GET') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::getProfile();
    }
    if ($uri === '/doctors/profile' && $method === 'PUT') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::updateProfile();
    }
    if ($uri === '/doctors/photo' && $method === 'POST') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::uploadPhoto();
    }
    if ($uri === '/doctors/upload' && $method === 'POST') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::uploadDoctor();
    }

    // ── Lookup ───────────────────────────────────────────────
    if ($uri === '/specialties' && $method === 'GET') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::getSpecialties();
    }
    if ($uri === '/wilayas' && $method === 'GET') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::getWilayas();
    }
    if ($uri === '/baladiyas' && $method === 'GET') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::getBaladiyas();
    }
    if ($uri === '/reasons' && $method === 'GET') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::getReasons();
    }

    // ── Doctors ──────────────────────────────────────────────
    if (isset($parts[0]) && $parts[0] === 'doctors' && isset($parts[1]) && !isset($parts[2]) && $method === 'GET') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::getDoctorPublicProfile($parts[1]);
    }

    // ── clinics ───────────────────────────────────────────────
    if ($uri === '/clinics' && $method === 'GET') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::search();
    }
    // /clinics/profile
    if ($uri === '/clinics/profile' && $method === 'GET') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::getProfile();
    }
    if ($uri === '/clinics/profile' && $method === 'PUT') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::updateProfile();
    }
    if ($uri === '/clinics/profile' && $method === 'POST') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::uploadProfile();
    }
    if ($uri === '/clinics/logo' && $method === 'POST') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::uploadSelfLogo();
    }

    // /clinics/:id
    if (isset($parts[0]) && $parts[0] === 'clinics' && isset($parts[1]) && !isset($parts[2]) && $method === 'GET') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::getClinic($parts[1]);
    }
    // /clinics/:id/photo
    if (isset($parts[0]) && $parts[0] === 'clinics' && isset($parts[1]) && ($parts[2] ?? '') === 'photo' && !isset($parts[3])) {
        require_once __DIR__ . '/controllers/ClinicController.php';
        if ($method === 'POST')
            ClinicController::uploadPhoto($parts[1]);
        if ($method === 'GET')
            ClinicController::getPhoto($parts[1]);
    }
    // /clinics/:cId/doctors/:dId
    if (isset($parts[0]) && $parts[0] === 'clinics' && isset($parts[3]) && ($parts[2] ?? '') === 'doctors' && $method === 'GET') {
        require_once __DIR__ . '/controllers/ClinicController.php';
        ClinicController::getDoctorAtClinic($parts[1], $parts[3]);
    }

    // ── Appointments ─────────────────────────────────────────
    if ($uri === '/appointments/available-slots' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AppointmentController.php';
        AppointmentController::getAvailableSlots();
    }
    if ($uri === '/appointments' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AppointmentController.php';
        AppointmentController::book();
    }
    if (isset($parts[0]) && $parts[0] === 'appointments' && isset($parts[1]) && !isset($parts[2])) {
        require_once __DIR__ . '/controllers/AppointmentController.php';
        if ($method === 'GET')
            AppointmentController::getOne($parts[1]);
        if ($method === 'DELETE')
            AppointmentController::cancel($parts[1]);
    }

    // ── Delphi Sync (مزامنة دلفي ↔ سيرفر) ───────────────────────
    // POST /api/apointements/sync  ← note: 'apointements' (Delphi spelling)
    if ($uri === '/apointements/sync' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AppointmentController.php';
        AppointmentController::sync();
    }


    // ── Chat ─────────────────────────────────────────────────
    if ($uri === '/chat/threads' && $method === 'GET') {
        require_once __DIR__ . '/controllers/ChatController.php';
        ChatController::getThreads();
    }
    if ($uri === '/chat/threads' && $method === 'POST') {
        require_once __DIR__ . '/controllers/ChatController.php';
        ChatController::createThread();
    }
    // /chat/threads/:id — get messages
    if (isset($parts[0]) && $parts[0] === 'chat' && ($parts[1] ?? '') === 'threads' && isset($parts[2]) && !isset($parts[3]) && $method === 'GET') {
        require_once __DIR__ . '/controllers/ChatController.php';
        ChatController::getMessages($parts[2]);
    }
    // /chat/threads/:id/messages — send message
    if (isset($parts[0]) && $parts[0] === 'chat' && ($parts[1] ?? '') === 'threads' && isset($parts[3]) && $parts[3] === 'messages' && $method === 'POST') {
        require_once __DIR__ . '/controllers/ChatController.php';
        ChatController::sendMessage($parts[2]);
    }

    // ── Ratings ───────────────────────────────────────────────
    if ($uri === '/ratings' && $method === 'POST') {
        require_once __DIR__ . '/controllers/RatingController.php';
        RatingController::addRating();
    }
    if (isset($parts[0]) && $parts[0] === 'ratings' && ($parts[1] ?? '') === 'doctor' && isset($parts[2]) && $method === 'GET') {
        require_once __DIR__ . '/controllers/RatingController.php';
        RatingController::getDoctorRatings($parts[2]);
    }

    // ── Sync (مزامنة دلفي ↔ سيرفر) ──────────────────────────
    if ($uri === '/sync/upload' && $method === 'POST') {
        require_once __DIR__ . '/controllers/SyncController.php';
        SyncController::upload();
    }
    if ($uri === '/sync/download' && $method === 'GET') {
        require_once __DIR__ . '/controllers/SyncController.php';
        SyncController::download();
    }
    if ($uri === '/sync/delete' && $method === 'POST') {
        require_once __DIR__ . '/controllers/SyncController.php';
        SyncController::delete();
    }
    if ($uri === '/sync/status' && $method === 'GET') {
        require_once __DIR__ . '/controllers/SyncController.php';
        SyncController::status();
    }
    if ($uri === '/sync/logs' && $method === 'GET') {
        require_once __DIR__ . '/controllers/SyncController.php';
        SyncController::logs();
    }
    if ($uri === '/sync/reasons' && $method === 'GET') {
        require_once __DIR__ . '/controllers/SyncController.php';
        SyncController::reasons();
    }

    // ── Public Registration (No auth) ─────────────────────────
    if ($uri === '/register/clinic' && $method === 'POST') {
        require_once __DIR__ . '/controllers/RegistrationController.php';
        RegistrationController::registerClinic();
    }
    if ($uri === '/register/doctor' && $method === 'POST') {
        require_once __DIR__ . '/controllers/RegistrationController.php';
        RegistrationController::registerDoctor();
    }
    if ($uri === '/register/status' && $method === 'GET') {
        require_once __DIR__ . '/controllers/RegistrationController.php';
        RegistrationController::checkStatus();
    }

    // ── Admin (usertype = 3) ──────────────────────────────────
    if ($uri === '/admin/stats' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AdminController.php';
        AdminController::stats();
    }
    if ($uri === '/admin/clinics' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AdminController.php';
        AdminController::listClinics();
    }
    if ($uri === '/admin/doctors' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AdminController.php';
        AdminController::listDoctors();
    }
    // /admin/clinics/:id/approve  |  /admin/clinics/:id/reject
    if (isset($parts[0]) && $parts[0] === 'admin' && ($parts[1] ?? '') === 'clinics' && isset($parts[2]) && isset($parts[3]) && $method === 'POST') {
        require_once __DIR__ . '/controllers/AdminController.php';
        if ($parts[3] === 'approve')
            AdminController::approveClinic($parts[2]);
        if ($parts[3] === 'reject')
            AdminController::rejectClinic($parts[2]);
    }
    // /admin/doctors/:id/approve  |  /admin/doctors/:id/reject
    if (isset($parts[0]) && $parts[0] === 'admin' && ($parts[1] ?? '') === 'doctors' && isset($parts[2]) && isset($parts[3]) && $method === 'POST') {
        require_once __DIR__ . '/controllers/AdminController.php';
        if ($parts[3] === 'approve')
            AdminController::approveDoctor($parts[2]);
        if ($parts[3] === 'reject')
            AdminController::rejectDoctor($parts[2]);
    }

    // ── Relations (Clinic-Doctor requests) ──────────────────────
    if ($uri === '/relations/request' && $method === 'POST') {
        require_once __DIR__ . '/controllers/RelationController.php';
        RelationController::sendRequest();
    }
    if ($uri === '/relations/requests' && $method === 'GET') {
        require_once __DIR__ . '/controllers/RelationController.php';
        RelationController::getRequests();
    }
    if (isset($parts[0]) && $parts[0] === 'relations' && ($parts[1] ?? '') === 'check' && isset($parts[2]) && !isset($parts[3]) && $method === 'GET') {
        require_once __DIR__ . '/controllers/RelationController.php';
        RelationController::checkRelation($parts[2]);
    }
    if (isset($parts[0]) && $parts[0] === 'relations' && ($parts[1] ?? '') === 'requests' && isset($parts[2]) && ($parts[3] ?? '') === 'respond' && $method === 'POST') {
        require_once __DIR__ . '/controllers/RelationController.php';
        RelationController::respondToRequest($parts[2]);
    }

    // ── tickets (Support) ──────────────────────────────────────
    if ($uri === '/tickets' && $method === 'POST') {
        require_once __DIR__ . '/controllers/TicketController.php';
        TicketController::create();
    }
    if ($uri === '/tickets' && $method === 'GET') {
        require_once __DIR__ . '/controllers/TicketController.php';
        TicketController::list();
    }
    if (isset($parts[0]) && $parts[0] === 'tickets' && isset($parts[1]) && !isset($parts[2])) {
        require_once __DIR__ . '/controllers/TicketController.php';
        if ($method === 'GET')
            TicketController::get($parts[1]);
    }
    if (isset($parts[0]) && $parts[0] === 'tickets' && isset($parts[2]) && $parts[2] === 'reply' && $method === 'POST') {
        require_once __DIR__ . '/controllers/TicketController.php';
        TicketController::reply($parts[1]);
    }
    if (isset($parts[0]) && $parts[0] === 'tickets' && isset($parts[2]) && $parts[2] === 'close' && $method === 'POST') {
        require_once __DIR__ . '/controllers/TicketController.php';
        TicketController::close($parts[1]);
    }

    // ── 404 ───────────────────────────────────────────────────
    Response::notFound("Route introuvable: $method $uri");

} catch (PDOException $e) {
    Response::serverError('Erreur base de données: ' . $e->getMessage());
} catch (Throwable $e) {
    Response::serverError('Erreur internet: ' . $e->getMessage());
}
