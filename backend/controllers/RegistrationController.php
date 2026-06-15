<?php
// ============================================================
// controllers/RegistrationController.php
// Public endpoints — no auth required
// POST /api/register/clinic  → clinicregistrations (PENDING)
// POST /api/register/doctor  → doctorregistrations (PENDING)
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
                // رسالة بشرية: حقل مطلوب ناقص عند تسجيل عيادة
                Response::error("يرجى ملء جميع الحقول المطلوبة: اسم العيادة، البريد الإلكتروني، رقم الهاتف، وكلمة المرور.", 422);
            }
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            // رسالة بشرية: بريد إلكتروني غير صالح للعيادة
            Response::error('البريد الإلكتروني الذي أدخلته غير صحيح. يرجى إدخال بريد إلكتروني صالح (مثال: exemple@gmail.com).', 422);
        }

        $pdo = Database::getInstance();

        require_once __DIR__ . '/../helpers/UserValidationHelper.php';

        // Check email uniqueness across all tables
        if (UserValidationHelper::isEmailDuplicate($data['email'])) {
            Response::error("البريد الإلكتروني مستخدم مسبقًا", 409);
        }

        // Check phone uniqueness across all tables
        if (!empty($data['phone']) && UserValidationHelper::isPhoneDuplicate($data['phone'])) {
            Response::error("رقم الهاتف مستخدم مسبقًا", 409);
        }

        $id             = UUIDHelper::generate();
        $passwordEncoded = base64_encode($data['password']);

        $pdo->prepare("
            INSERT INTO clinicregistrations (id, clinicname, email, phone, address, notes, password, status)
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

        // Send email validation OTP
        $otpCode = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $verifyId = UUIDHelper::generate();
        $expiresAt = date('Y-m-d H:i:s', time() + 86400); // 24 hours for clinic/doctor registration

        $pdo->prepare("
            INSERT INTO verifications (id, user_id, type, target, code, expires_at, verified)
            VALUES (?, ?, 'email', ?, ?, ?, 0)
        ")->execute([$verifyId, $id, $data['email'], $otpCode, $expiresAt]);

        require_once __DIR__ . '/../helpers/EmailHelper.php';
        if (class_exists('EmailHelper') && method_exists('EmailHelper', 'sendOTP')) {
             EmailHelper::sendOTP($data['email'], trim($data['clinic_name']), $otpCode);
        } else {
             $subject = "🔐 Code de vérification — Tabibi طبيبي";
             $body = "<p>مرحباً " . trim($data['clinic_name']) . "،</p><p>رمز التحقق الخاص بك هو: <strong>$otpCode</strong></p>";
             $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: no-reply@webtabibi.com\r\n";
             @mail($data['email'], $subject, $body, $headers);
        }

        Response::success(
            ['registration_id' => $id, 'requires_verification' => true],
            'تم إرسال طلب تسجيل العيادة بنجاح، يرجى تأكيد البريد الإلكتروني أولاً وسيتم مراجعته من طرف الإدارة',
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
                // رسالة بشرية: حقل مطلوب ناقص عند تسجيل طبيب
                Response::error("يرجى ملء جميع الحقول المطلوبة: الاسم الكامل، التخصص، البريد الإلكتروني، رقم الهاتف، وكلمة المرور.", 422);
            }
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            // رسالة بشرية: بريد إلكتروني غير صالح للطبيب
            Response::error('البريد الإلكتروني الذي أدخلته غير صحيح. يرجى إدخال بريد إلكتروني صالح (مثال: exemple@gmail.com).', 422);
        }

        $pdo = Database::getInstance();

        require_once __DIR__ . '/../helpers/UserValidationHelper.php';

        // Check email uniqueness across all tables (exclude if claiming own dummy profile)
        $claimId = !empty($data['doctor_id']) ? $data['doctor_id'] : null;
        if (UserValidationHelper::isEmailDuplicate($data['email'], $claimId)) {
            Response::error("البريد الإلكتروني مستخدم مسبقًا", 409);
        }

        // Check phone uniqueness across all tables
        if (!empty($data['phone']) && UserValidationHelper::isPhoneDuplicate($data['phone'], $claimId)) {
            Response::error("رقم الهاتف مستخدم مسبقًا", 409);
        }

        $id             = UUIDHelper::generate();
        $passwordEncoded = base64_encode($data['password']);
        $doctorId       = !empty($data['doctor_id']) ? $data['doctor_id'] : null;

        $pdo->prepare("
            INSERT INTO doctorregistrations (id, fullname, speciality, email, phone, password, status, nin, doctor_id)
            VALUES (?,?,?,?,?,?, 'PENDING', ?, ?)
        ")->execute([
            $id,
            trim($data['fullname']),
            trim($data['speciality']),
            trim($data['email']),
            trim($data['phone']),
            $passwordEncoded,
            $data['nin'] ?? null,
            $doctorId
        ]);

        // Send email validation OTP
        $otpCode = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $verifyId = UUIDHelper::generate();
        $expiresAt = date('Y-m-d H:i:s', time() + 86400); // 24 hours

        $pdo->prepare("
            INSERT INTO verifications (id, user_id, type, target, code, expires_at, verified)
            VALUES (?, ?, 'email', ?, ?, ?, 0)
        ")->execute([$verifyId, $id, $data['email'], $otpCode, $expiresAt]);

        require_once __DIR__ . '/../helpers/EmailHelper.php';
        if (class_exists('EmailHelper') && method_exists('EmailHelper', 'sendOTP')) {
             EmailHelper::sendOTP($data['email'], trim($data['fullname']), $otpCode);
        } else {
             $subject = "🔐 Code de vérification — Tabibi طبيبي";
             $body = "<p>مرحباً " . trim($data['fullname']) . "،</p><p>رمز التحقق الخاص بك هو: <strong>$otpCode</strong></p>";
             $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: no-reply@webtabibi.com\r\n";
             @mail($data['email'], $subject, $body, $headers);
        }

        Response::success(
            ['registration_id' => $id, 'requires_verification' => true],
            'تم إرسال طلب تسجيل الطبيب بنجاح، يرجى تأكيد البريد الإلكتروني أولاً وسيتم مراجعته من طرف الإدارة',
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

        if (!$email) Response::error('يرجى توفير عنوان البريد الإلكتروني للتحقق من حالة طلب التسجيل.', 422);

        $pdo   = Database::getInstance();
        $table = $type === 'doctor' ? 'doctorregistrations' : 'clinicregistrations';

        $stmt = $pdo->prepare("SELECT status, rejectedreason, approvedat, createdat FROM $table WHERE email=? LIMIT 1");
        $stmt->execute([$email]);
        $row = $stmt->fetch();

        if (!$row) Response::notFound('لم يتم العثور على طلب تسجيل مرتبط بهذا البريد الإلكتروني. تأكد من البريد وحاول مرة أخرى.');

        Response::success($row);
    }
}
