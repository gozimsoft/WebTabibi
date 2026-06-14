<?php
// ============================================================
// middleware/AuthMiddleware.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

class AuthMiddleware {

    /**
     * Validate Bearer token from Authorization header.
     * Returns user row or calls Response::unauthorized().
     */
    public static function authenticate(bool $required = true): ?array {
        // متوافق مع Apache Module و CGI و FastCGI
        $authHeader = $_SERVER['HTTP_AUTHORIZATION']
                   ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
                   ?? '';
        // Fallback: getallheaders() إذا كانت متاحة ولم تُوجد القيمة بعد
        if (!$authHeader && function_exists('getallheaders')) {
            $hdrs = getallheaders();
            $authHeader = $hdrs['Authorization'] ?? $hdrs['authorization'] ?? '';
        }

        if (!preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
            if (!$required) return null;
            // رسالة بشرية: جلسة المستخدم غير موجودة
            Response::unauthorized('جلستك غير صالحة. يرجى تسجيل الدخول من جديد للمتابعة.');
        }

        $token = trim($matches[1]);
        $pdo   = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT s.user_id, s.created_at, u.usertype, u.username
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ?
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $session = $stmt->fetch();

        if (!$session) {
            if (!$required) return null;
            // رسالة بشرية: رمز الجلسة غير صحيح
            Response::unauthorized('انتهت جلستك أو أنها غير صالحة. يرجى تسجيل الخروج وإعادة تسجيل الدخول.');
        }

        // Check expiry
        $created = strtotime($session['created_at']);
        if (time() - $created > 86400 * 30) { // Using 30 days if TOKEN_EXPIRY not defined, or adjust to your needs
            // Delete expired session
            $pdo->prepare("DELETE FROM sessions WHERE token = ?")->execute([$token]);
            if (!$required) return null;
            // رسالة بشرية: انتهت صلاحية الجلسة
            Response::unauthorized('انتهت صلاحية جلستك (30 يوماً). يرجى تسجيل الدخول مرة أخرى للاستمرار.');
        }

        return $session;
    }

    /**
     * Only patients (usertype = 0) allowed.
     */
    public static function patientOnly(): array {
        $session = self::authenticate();
        if ((int)$session['usertype'] !== 0) {
            // رسالة بشرية: الوصول مقيد للمرضى فقط
            Response::error('هذه الخدمة متاحة للمرضى فقط. يرجى تسجيل الدخول بحساب مريض.', 403);
        }
        return $session;
    }

    /**
     * Only doctors (usertype = 1) allowed.
     */
    public static function doctorOnly(): array {
        $session = self::authenticate();
        if ((int)$session['usertype'] !== 1) {
            // رسالة بشرية: الوصول مقيد للأطباء فقط
            Response::error('هذه الخدمة متاحة للأطباء فقط. يرجى تسجيل الدخول بحساب طبيب.', 403);
        }
        return $session;
    }

    /**
     * Only clinics (usertype = 2) allowed.
     */
    public static function clinicOnly(): array {
        $session = self::authenticate();
        if ((int)$session['usertype'] !== 2) {
            // رسالة بشرية: الوصول مقيد للعيادات فقط
            Response::error('هذه الخدمة متاحة للعيادات فقط. يرجى تسجيل الدخول بحساب عيادة.', 403);
        }
        return $session;
    }

    /**
     * Only admins (usertype = 3) allowed.
     */
    public static function adminOnly(): array {
        $session = self::authenticate();
        if ((int)$session['usertype'] !== 3) {
            // رسالة بشرية: الوصول مقيد للمشرفين فقط
            Response::error('هذه الصفحة مخصصة للمشرفين فقط. ليس لديك صلاحية الوصول إليها.', 403);
        }
        return $session;
    }
}
