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

$uri = preg_replace('#^/tabibi/backend#', '', $uri);
$uri = preg_replace('#^/api#', '', $uri);
$parts = array_values(array_filter(explode('/', ltrim($uri, '/'))));

try {
    // ── Health & Debug ──────────────────────────────────────
    if ($uri === '/health' && $method === 'GET') {
        Response::success(['status' => 'ok', 'api' => 'Tabibi v2', 'time' => date('c')]);
    }
    if ($uri === '/debug-email' && $method === 'GET') {
        require_once __DIR__ . '/middleware/AuthMiddleware.php';
        AuthMiddleware::adminOnly();
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
    if ($uri === '/auth/register-confirm' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::registerConfirm();
    }
    if ($uri === '/auth/login' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::login();
    }
    if ($uri === '/auth/google' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::google();
    }
    if ($uri === '/auth/logout' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::logout();
    }
    if ($uri === '/auth/me' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::me();
    }
    if ($uri === '/auth/forgot-password' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::forgotPassword();
    }
    if ($uri === '/auth/verify-otp' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::verifyOtp();
    }
    if ($uri === '/auth/verify-account-email' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::verifyAccountEmail();
    }
    if ($uri === '/auth/reset-password' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        AuthController::resetPassword();
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
    // PUT /api/patients/credentials — تغيير اسم المستخدم أو كلمة المرور للمريض
    if ($uri === '/patients/credentials' && $method === 'PUT') {
        require_once __DIR__ . '/controllers/PatientController.php';
        PatientController::updateCredentials();
    }
    if ($uri === '/patients/appointments' && $method === 'GET') {
        require_once __DIR__ . '/controllers/PatientController.php';
        PatientController::getAppointments();
    }
    if ($uri === '/patients/attending-doctor' && $method === 'GET') {
        require_once __DIR__ . '/controllers/PatientController.php';
        PatientController::getAttendingDoctor();
    }
    if ($uri === '/patients/attending-doctor' && $method === 'POST') {
        require_once __DIR__ . '/controllers/PatientController.php';
        PatientController::setAttendingDoctor();
    }
    if ($uri === '/patients/attending-doctor' && $method === 'DELETE') {
        require_once __DIR__ . '/controllers/PatientController.php';
        PatientController::removeAttendingDoctor();
    }
    if ($uri === '/patients/attending-doctor/history' && $method === 'GET') {
        require_once __DIR__ . '/controllers/PatientController.php';
        PatientController::getAttendingDoctorHistory();
    }
    if ($uri === '/patients/attending-doctor/search' && $method === 'GET') {
        require_once __DIR__ . '/controllers/PatientController.php';
        PatientController::searchDoctorsForAttending();
    }

    // ── PHASE 02C : Consentements & Droits utilisateurs ──────────
    // GET  /api/consent/my          → État des consentements de l'utilisateur
    // POST /api/consent/withdraw    → Retrait d'un consentement (Art. 35-36 Loi 18-07)
    // DELETE /api/patients/account  → Suppression/anonymisation de compte patient (Art. 35)
    if ($uri === '/consent/my' && $method === 'GET') {
        require_once __DIR__ . '/controllers/ConsentController.php';
        ConsentController::getMy();
    }
    if ($uri === '/consent/withdraw' && $method === 'POST') {
        require_once __DIR__ . '/controllers/ConsentController.php';
        ConsentController::withdraw();
    }
    if ($uri === '/patients/account' && $method === 'DELETE') {
        require_once __DIR__ . '/controllers/ConsentController.php';
        ConsentController::deleteAccount();
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
    // ── Doctor Consultation Reasons ───────────────────────────
    if ($uri === '/doctors/reasons' && $method === 'GET') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::getReasons();
    }
    if ($uri === '/doctors/reasons' && $method === 'POST') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::addReason();
    }
    if (isset($parts[0]) && $parts[0] === 'doctors' && isset($parts[1]) && $parts[1] === 'reasons' && isset($parts[2]) && $method === 'DELETE') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::deleteReason($parts[2]);
    }

    // ── Doctor Appointment Settings (SettingApointements) ──────
    if ($uri === '/doctors/appointment-settings' && $method === 'GET') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::getAppointmentSettings();
    }
    if ($uri === '/doctors/appointment-settings' && $method === 'POST') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::createAppointmentSetting();
    }
    if (isset($parts[0]) && $parts[0] === 'doctors' && isset($parts[1]) && $parts[1] === 'appointment-settings' && isset($parts[2]) && $method === 'PUT') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::updateAppointmentSetting($parts[2]);
    }
    if (isset($parts[0]) && $parts[0] === 'doctors' && isset($parts[1]) && $parts[1] === 'appointment-settings' && isset($parts[2]) && $method === 'DELETE') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::deleteAppointmentSetting($parts[2]);
    }

    // ── Doctor Off-Hours (DoctorsOffHours) ────────────────────
    if ($uri === '/doctors/off-hours' && $method === 'GET') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::getOffHours();
    }
    if ($uri === '/doctors/off-hours' && $method === 'POST') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::createOffHour();
    }
    if (isset($parts[0]) && $parts[0] === 'doctors' && isset($parts[1]) && $parts[1] === 'off-hours' && isset($parts[2]) && $method === 'PUT') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::updateOffHour($parts[2]);
    }
    if (isset($parts[0]) && $parts[0] === 'doctors' && isset($parts[1]) && $parts[1] === 'off-hours' && isset($parts[2]) && $method === 'DELETE') {
        require_once __DIR__ . '/controllers/DoctorController.php';
        DoctorController::deleteOffHour($parts[2]);
    }

    // GET /api/doctor/appointments — Doctor appointment manager
    if ($uri === '/doctor/appointments' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AppointmentController.php';
        AppointmentController::getDoctorAppointments();
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

    // ── Public Stats ─────────────────────────────────────────
    if ($uri === '/public/stats' && $method === 'GET') {
        require_once __DIR__ . '/controllers/PublicController.php';
        PublicController::getStats();
    }
    if ($uri === '/visits' && $method === 'POST') {
        require_once __DIR__ . '/controllers/PublicController.php';
        PublicController::logVisit();
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

    // GET /api/appointments/manager — Web dashboard (doctor)
    // IMPORTANT: must be BEFORE the generic /appointments/:id route
    if ($uri === '/appointments/manager' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AppointmentController.php';
        AppointmentController::getForManager();
    }
    // GET /api/appointments/sync-check — Lightweight real-time sync check
    if ($uri === '/appointments/sync-check' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AppointmentController.php';
        AppointmentController::checkSync();
    }
    // POST /api/appointments/manager/add — Add new appointment from web dashboard
    if ($uri === '/appointments/manager/add' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AppointmentController.php';
        AppointmentController::addFromDashboard();
    }
    // PUT /api/appointments/:id/status — Update appointment status from web
    if (isset($parts[0]) && $parts[0] === 'appointments' && isset($parts[1]) && ($parts[2] ?? '') === 'status' && $method === 'PUT') {
        require_once __DIR__ . '/controllers/AppointmentController.php';
        AppointmentController::updateStatus($parts[1]);
    }

    // Generic /appointments/:id  — must come AFTER named routes
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
    // /admin/clinics/:id/approve  |  /admin/clinics/:id/reject  |  /admin/clinics/:id/freeze  |  /admin/clinics/:id/release
    if (isset($parts[0]) && $parts[0] === 'admin' && ($parts[1] ?? '') === 'clinics' && isset($parts[2]) && isset($parts[3]) && $method === 'POST') {
        require_once __DIR__ . '/controllers/AdminController.php';
        if ($parts[3] === 'approve')
            AdminController::approveClinic($parts[2]);
        if ($parts[3] === 'reject')
            AdminController::rejectClinic($parts[2]);
        if ($parts[3] === 'freeze')
            AdminController::freezeClinic($parts[2]);
        if ($parts[3] === 'release')
            AdminController::releaseClinic($parts[2]);
    }
    // /admin/doctors/:id/approve  |  /admin/doctors/:id/reject  |  /admin/doctors/:id/freeze  |  /admin/doctors/:id/release
    if (isset($parts[0]) && $parts[0] === 'admin' && ($parts[1] ?? '') === 'doctors' && isset($parts[2]) && isset($parts[3]) && $method === 'POST') {
        require_once __DIR__ . '/controllers/AdminController.php';
        if ($parts[3] === 'approve')
            AdminController::approveDoctor($parts[2]);
        if ($parts[3] === 'reject')
            AdminController::rejectDoctor($parts[2]);
        if ($parts[3] === 'freeze')
            AdminController::freezeDoctor($parts[2]);
        if ($parts[3] === 'release')
            AdminController::releaseDoctor($parts[2]);
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
    // GET /api/tickets/check-open — التحقق من وجود تذكرة مفتوحة لمريض مع طبيب أو عيادة
    if ($uri === '/tickets/check-open' && $method === 'GET') {
        require_once __DIR__ . '/controllers/TicketController.php';
        TicketController::checkOpen();
    }
    if (isset($parts[0]) && $parts[0] === 'tickets' && isset($parts[1]) && !isset($parts[2]) && $parts[1] !== 'check-open') {
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

    // ── Support Administratif & Réclamations (Admin Support Tickets) ───
    // User endpoints:
    if ($uri === '/support/tickets' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AdminSupportTicketController.php';
        AdminSupportTicketController::createUserTicket();
    }
    if ($uri === '/support/tickets' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AdminSupportTicketController.php';
        AdminSupportTicketController::listUserTickets();
    }
    if (isset($parts[0]) && $parts[0] === 'support' && ($parts[1] ?? '') === 'tickets' && isset($parts[2]) && !isset($parts[3]) && $method === 'GET') {
        require_once __DIR__ . '/controllers/AdminSupportTicketController.php';
        AdminSupportTicketController::getUserTicket($parts[2]);
    }
    if (isset($parts[0]) && $parts[0] === 'support' && ($parts[1] ?? '') === 'tickets' && isset($parts[2]) && ($parts[3] ?? '') === 'reply' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AdminSupportTicketController.php';
        AdminSupportTicketController::userReply($parts[2]);
    }

    // Admin / Support staff endpoints:
    if ($uri === '/admin/support-tickets' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AdminSupportTicketController.php';
        AdminSupportTicketController::listAdminTickets();
    }
    if ($uri === '/admin/support-tickets/stats' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AdminSupportTicketController.php';
        AdminSupportTicketController::getAdminStats();
    }
    if (isset($parts[0]) && $parts[0] === 'admin' && ($parts[1] ?? '') === 'support-tickets' && isset($parts[2]) && !isset($parts[3]) && $parts[2] !== 'stats' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AdminSupportTicketController.php';
        AdminSupportTicketController::getAdminTicket($parts[2]);
    }
    if (isset($parts[0]) && $parts[0] === 'admin' && ($parts[1] ?? '') === 'support-tickets' && isset($parts[2]) && ($parts[3] ?? '') === 'reply' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AdminSupportTicketController.php';
        AdminSupportTicketController::adminReply($parts[2]);
    }
    if (isset($parts[0]) && $parts[0] === 'admin' && ($parts[1] ?? '') === 'support-tickets' && isset($parts[2]) && ($parts[3] ?? '') === 'status' && ($method === 'PUT' || $method === 'POST')) {
        require_once __DIR__ . '/controllers/AdminSupportTicketController.php';
        AdminSupportTicketController::updateStatus($parts[2]);
    }

    // ── Notifications ─────────────────────────────────────────
    if ($uri === '/notifications' && $method === 'GET') {
        require_once __DIR__ . '/controllers/NotificationController.php';
        NotificationController::list();
    }
    if ($uri === '/notifications/read-all' && $method === 'PUT') {
        require_once __DIR__ . '/controllers/NotificationController.php';
        NotificationController::markAllAsRead();
    }
    if (isset($parts[0]) && $parts[0] === 'notifications' && isset($parts[1])) {
        require_once __DIR__ . '/controllers/NotificationController.php';
        if ($parts[1] !== 'read-all') {
            // Support both PUT /notifications/:id and PUT /notifications/:id/read
            if ($method === 'PUT' && (!isset($parts[2]) || $parts[2] === 'read')) {
                NotificationController::markAsRead($parts[1]);
            }
            if ($method === 'DELETE' && !isset($parts[2])) {
                NotificationController::delete($parts[1]);
            }
        }
    }

    // ── 404 ───────────────────────────────────────────────────
    // رسالة بشرية: الصفحة أو الخدمة المطلوبة غير موجودة
    Response::notFound("الصفحة أو الخدمة التي تبحث عنها غير موجودة. يرجى التحقق من الرابط والمحاولة مرة أخرى.");

} catch (PDOException $e) {
    // رسالة بشرية: خطأ في الاتصال بقاعدة البيانات
    Response::serverError('حدث خطأ في الخادم أثناء معالجة طلبك. يرجى المحاولة مرة أخرى بعد قليل. إذا استمرت المشكلة يرجى التواصل مع الدعم الفني.');
} catch (Throwable $e) {
    // رسالة بشرية: خطأ غير متوقع في الخادم
    Response::serverError('حدث خطأ غير متوقع في الخادم. يرجى المحاولة مرة أخرى. إذا استمرت المشكلة يرجى إبلاغ الدعم الفني.');
}
