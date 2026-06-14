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
    // Body: { type: "email" | "phone" }
    // Sends an OTP to the patient's email or phone
    // ----------------------------------------------------------
    public static function send(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $type    = $data['type'] ?? '';

        if (!in_array($type, ['email', 'phone'])) {
            // رسالة بشرية: نوع التحقق غير صالح
            Response::error("نوع التحقق غير صالح. يرجى اختيار البريد الإلكتروني أو رقم الهاتف.", 422);
        }

        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        $target = $type === 'email' ? $patient['email'] : $patient['phone'];
        if (empty($target)) {
            // رسالة بشرية: البريد أو الهاتف غير موجود في الملف الشخصي
            Response::error("لا يوجد {$type} مسجل في ملفك الشخصي. يرجى إضافته أولاً من إعدادات الملف الشخصي.", 400);
        }

        // Check if already verified
        $alreadyVerified = $type === 'email'
            ? (int)($patient['emailvalidation'] ?? 0)
            : (int)($patient['phonevalidation'] ?? 0);

        if ($alreadyVerified) {
            Response::success(null, ($type === 'email' ? 'البريد الإلكتروني' : 'رقم الهاتف') . " مفعّل بالفعل ✓");
        }

        // Delete old OTPs for this user/type
        $pdo->prepare("DELETE FROM verifications WHERE user_id = ? AND type = ?")->execute([$patient['id'], $type]);

        // Generate 6-digit OTP
        $code    = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $id      = UUIDHelper::generate();
        $expires = date('Y-m-d H:i:s', time() + 600); // 10 minutes

        $pdo->prepare("
            INSERT INTO verifications (id, user_id, type, target, code, expires_at, verified)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        ")->execute([$id, $patient['id'], $type, $target, $code, $expires]);

        $sent = false;
        if ($type === 'email') {
            $sent = self::sendEmailOTP($target, $patient['fullname'], $code);
        }
        // phone: no SMS service — return code in DEV mode only
        $devCode = (defined('APP_ENV') && APP_ENV === 'production') ? null : $code;

        Response::success([
            'target'    => self::maskTarget($type, $target),
            'type'      => $type,
            'expires_in'=> 600,
            // Only in development — remove in production!
            'dev_code'  => $devCode,
            'email_sent'=> $sent,
        ], "تم إرسال رمز التحقق بنجاح إلى " . self::maskTarget($type, $target));
    }

    // ----------------------------------------------------------
    // POST /api/verify/confirm
    // Body: { type: "email" | "phone", code: "123456" }
    // ----------------------------------------------------------
    public static function confirm(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $type    = $data['type'] ?? '';
        $code    = trim($data['code'] ?? '');

        if (!in_array($type, ['email', 'phone'])) {
            // رسالة بشرية: نوع التحقق غير صالح عند التأكيد
            Response::error("نوع التحقق غير صالح. يرجى اختيار البريد الإلكتروني أو رقم الهاتف.", 422);
        }
        if (empty($code)) {
            // رسالة بشرية: رمز OTP مطلوب
            Response::error("يرجى إدخال رمز التحقق المكوّن من 6 أرقام.", 422);
        }

        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        $stmt = $pdo->prepare("
            SELECT * FROM verifications
            WHERE user_id = ? AND type = ? AND code = ?
              AND verified = 0 AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute([$patient['id'], $type, $code]);
        $verification = $stmt->fetch();

        if (!$verification) {
            // رسالة بشرية: رمز التحقق خاطئ أو منتهي الصلاحية
            Response::error("الرمز الذي أدخلته غير صحيح أو انتهت صلاحيته. يرجى طلب رمز جديد والمحاولة مرة أخرى.", 400);
        }

        // Mark OTP as used
        $pdo->prepare("UPDATE verifications SET verified = 1 WHERE id = ?")->execute([$verification['id']]);

        // Update patient validation field
        $field = $type === 'email' ? 'emailvalidation' : 'phonevalidation';
        $pdo->prepare("UPDATE patients SET `$field` = 1 WHERE id = ?")->execute([$patient['id']]);

        Response::success(['type' => $type, 'verified' => true], ($type === 'email' ? 'تم التحقق من البريد الإلكتروني بنجاح ✓' : 'تم التحقق من رقم الهاتف بنجاح ✓'));
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
            'email_verified' => (bool)$patient['emailvalidation'],
            'phone_verified' => (bool)$patient['phonevalidation'],
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
