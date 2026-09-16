<?php
// ============================================================
// controllers/VerificationController.php
// OTP-based email & phone Verification
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';
require_once __DIR__ . '/../config/database.php';

class VerificationController {

    // ----------------------------------------------------------
    // POST /api/verify/send
    // Body: { type: "email" }
    // Sends an OTP to the patient's email
    // ----------------------------------------------------------
    public static function send(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $type    = $data['type'] ?? '';

        // تم إيقاف ميزة التحقق من الهاتف بالـ OTP ويتم قبول البريد الإلكتروني فقط
        if ($type === 'phone') {
            Response::success(null, "رقم الهاتف مفعّل ومؤكد تلقائياً.");
        }

        if ($type !== 'email') {
            Response::error("نوع التحقق غير صالح. يرجى اختيار البريد الإلكتروني.", 422);
        }

        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        $target = $patient['email'];
        if (empty($target)) {
            Response::error("لا يوجد بريد إلكتروني مسجل في ملفك الشخصي. يرجى إضافته أولاً من إعدادات الملف الشخصي.", 400);
        }

        // Check if already verified
        if ((int)($patient['emailvalidation'] ?? 0) === 1) {
            Response::success(null, "البريد الإلكتروني مفعّل بالفعل ✓");
        }

        // Delete old OTPs for this user/type
        $pdo->prepare("DELETE FROM verifications WHERE user_id = ? AND type = 'email'")->execute([$patient['id']]);

        // Generate 6-digit OTP
        $code    = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $id      = UUIDHelper::generate();
        $expires = date('Y-m-d H:i:s', time() + 600); // 10 minutes

        $pdo->prepare("
            INSERT INTO verifications (id, user_id, type, target, code, expires_at, verified)
            VALUES (?, ?, 'email', ?, ?, ?, 0)
        ")->execute([$id, $patient['id'], $target, $code, $expires]);

        // Send OTP using EmailHelper (SMTP)
        require_once __DIR__ . '/../helpers/EmailHelper.php';
        $sent = false;
        if (class_exists('EmailHelper') && method_exists('EmailHelper', 'sendOTP')) {
            $sent = EmailHelper::sendOTP($target, $patient['fullname'] ?? '', $code);
        } else {
            $sent = self::sendEmailOTP($target, $patient['fullname'] ?? '', $code);
        }

        Response::success([
            'target'    => self::maskTarget('email', $target),
            'type'      => 'email',
            'expires_in'=> 600,
            'email_sent'=> $sent,
        ], "تم إرسال رمز التحقق بنجاح إلى " . self::maskTarget('email', $target));
    }

    // ----------------------------------------------------------
    // POST /api/verify/confirm
    // Body: { type: "email", code: "123456" }
    // ----------------------------------------------------------
    public static function confirm(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $type    = $data['type'] ?? 'email';
        $code    = trim($data['code'] ?? '');

        if ($type === 'phone') {
            Response::success(['type' => 'phone', 'verified' => true], 'تم التحقق من رقم الهاتف بنجاح ✓');
            return;
        }

        if ($type !== 'email') {
            Response::error("نوع التحقق غير صالح.", 422);
        }
        if (empty($code)) {
            Response::error("يرجى إدخال رمز التحقق المكوّن من 6 أرقام.", 422);
        }

        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        $stmt = $pdo->prepare("
            SELECT * FROM verifications
            WHERE user_id = ? AND type = 'email' AND code = ?
              AND verified = 0 AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute([$patient['id'], $code]);
        $verification = $stmt->fetch();

        if (!$verification) {
            Response::error("الرمز الذي أدخلته غير صحيح أو انتهت صلاحيته. يرجى طلب رمز جديد والمحاولة مرة أخرى.", 400);
        }

        // Mark OTP as used
        $pdo->prepare("UPDATE verifications SET verified = 1 WHERE id = ?")->execute([$verification['id']]);

        // Update patient validation field
        $pdo->prepare("UPDATE patients SET emailvalidation = 1 WHERE id = ?")->execute([$patient['id']]);

        Response::success(['type' => 'email', 'verified' => true], 'تم التحقق من البريد الإلكتروني بنجاح ✓');
    }

    // ----------------------------------------------------------
    // GET /api/verify/status
    // Returns current verification status
    // ----------------------------------------------------------
    public static function status(): void {
        $session = AuthMiddleware::patientOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT emailvalidation, phonevalidation, email, phone FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        Response::success([
            'email_verified' => (bool)($patient['emailvalidation'] ?? 0),
            'phone_verified' => !empty($patient['phone']), // الهاتف مؤكد دائماً بمجرد إدخاله
            'has_email'      => !empty($patient['email']),
            'has_phone'      => !empty($patient['phone']),
            'email_masked'   => !empty($patient['email']) ? self::maskTarget('email', $patient['email']) : null,
            'phone_masked'   => !empty($patient['phone']) ? self::maskTarget('phone', $patient['phone']) : null,
        ]);
    }

    // ── Private Helpers ─────────────────────────────────────────
    private static function sendEmailOTP(string $to, string $name, string $code): bool {
        $subject = "🔐 Code de vérification — Tabibi طبيبي";
        $body    = "
        <html><body style='font-family:Arial,sans-serif;background:#f4f7fb;padding:20px'>
        <div style='max-width:400px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)'>
          <div style='background:linear-gradient(135deg,#0d6efd,#0096c7);padding:24px;text-align:center'>
            <h1 style='color:#fff;margin:0;font-size:22px'>طبيبي — Tabibi</h1>
          </div>
          <div style='padding:30px;text-align:center'>
            <p style='color:#374151;font-size:16px'>مرحباً <strong>$name</strong>،</p>
            <p style='color:#6b7280;font-size:14px'>رمز التحقق الخاص بك هو:</p>
            <div style='background:#f0fdfa;border:2px dashed #0891b2;border-radius:12px;padding:20px;margin:20px 0'>
              <span style='font-size:36px;font-weight:900;letter-spacing:10px;color:#0891b2'>$code</span>
            </div>
            <p style='color:#ef4444;font-size:13px'>⏰ صالح لمدة 10 دقائق فقط</p>
            <p style='color:#9ca3af;font-size:12px'>إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.</p>
          </div>
        </div>
        </body></html>";
        $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: " . MAIL_NAME . " <" . MAIL_USER . ">\r\n";
        return @mail($to, $subject, $body, $headers);
    }

    private static function maskTarget(string $type, string $target): string {
        if ($type === 'email') {
            [$local, $domain] = explode('@', $target, 2) + ['', ''];
            return substr($local, 0, 2) . str_repeat('*', max(1, strlen($local) - 2)) . '@' . $domain;
        }
        // phone: show first 4 and last 2 digits
        return substr($target, 0, 4) . str_repeat('*', max(1, strlen($target) - 6)) . substr($target, -2);
    }
}
