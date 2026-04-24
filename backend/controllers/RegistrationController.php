<?php
// ============================================================
// controllers/RegistrationController.php
// Public endpoints — no auth required
// POST /api/register/clinic  → ClinicRegistrations (PENDING)
// POST /api/register/doctor  → DoctorRegistrations (PENDING)
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';

class RegistrationController {

    // ----------------------------------------------------------
    // POST /api/register/clinic
    // Body: { clinic_name, email, phone, password, address, notes }
    // ----------------------------------------------------------
    public static function registerClinic(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $required = ['clinic_name', 'email', 'phone', 'password'];
        foreach ($required as $f) {
            if (empty($data[$f])) {
                Response::error("Le champ '$f' est requis.", 422);
            }
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Email invalide.', 422);
        }

        $pdo = Database::getInstance();

        // Check email uniqueness
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM ClinicRegistrations WHERE Email=?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetchColumn() > 0) {
            Response::error("Cet email est déjà utilisé pour une demande d'inscription.", 409);
        }

        $id             = UUIDHelper::generate();
        $passwordEncoded = base64_encode($data['password']);

        $pdo->prepare("
            INSERT INTO ClinicRegistrations (ID, ClinicName, Email, Phone, Address, Notes, Password, Status)
            VALUES (?,?,?,?,?,?, ?, 'PENDING')
        ")->execute([
            $id,
            trim($data['clinic_name']),
            trim($data['email']),
            trim($data['phone']),
            $data['address'] ?? '',
            $data['notes']   ?? '',
            $passwordEncoded,
        ]);

        Response::success(
            ['registration_id' => $id],
            'تم إرسال طلب تسجيل العيادة بنجاح، سيتم مراجعته من طرف الإدارة',
            201
        );
    }

    // ----------------------------------------------------------
    // POST /api/register/doctor
    // Body: { fullname, speciality, email, phone, password, clinic_name? }
    // ----------------------------------------------------------
    public static function registerDoctor(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $required = ['fullname', 'speciality', 'email', 'phone', 'password'];
        foreach ($required as $f) {
            if (empty($data[$f])) {
                Response::error("Le champ '$f' est requis.", 422);
            }
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Email invalide.', 422);
        }

        $pdo = Database::getInstance();

        // Check email uniqueness
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM DoctorRegistrations WHERE Email=?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetchColumn() > 0) {
            Response::error("Cet email est déjà utilisé pour une demande d'inscription.", 409);
        }

        $id             = UUIDHelper::generate();
        $passwordEncoded = base64_encode($data['password']);

        $pdo->prepare("
            INSERT INTO DoctorRegistrations (ID, FullName, Speciality, Email, Phone, Password, Status)
            VALUES (?,?,?,?,?,?, 'PENDING')
        ")->execute([
            $id,
            trim($data['fullname']),
            trim($data['speciality']),
            trim($data['email']),
            trim($data['phone']),
            $passwordEncoded,
        ]);

        Response::success(
            ['registration_id' => $id],
            'تم إرسال طلب تسجيل الطبيب بنجاح، بانتظار موافقة الإدارة',
            201
        );
    }

    // ----------------------------------------------------------
    // GET /api/register/status?email=&type=clinic|doctor
    // Check registration request status
    // ----------------------------------------------------------
    public static function checkStatus(): void {
        $email = $_GET['email'] ?? '';
        $type  = $_GET['type']  ?? 'clinic';

        if (!$email) Response::error('Email requis', 422);

        $pdo   = Database::getInstance();
        $table = $type === 'doctor' ? 'DoctorRegistrations' : 'ClinicRegistrations';

        $stmt = $pdo->prepare("SELECT Status, RejectedReason, ApprovedAt, CreatedAt FROM $table WHERE Email=? LIMIT 1");
        $stmt->execute([$email]);
        $row = $stmt->fetch();

        if (!$row) Response::notFound('Aucune demande trouvée pour cet email');

        Response::success($row);
    }
}
