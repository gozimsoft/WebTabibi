<?php
// ============================================================
// controllers/AuthController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';

class AuthController {

    // ----------------------------------------------------------
    // POST /api/auth/register
    // Body: { username, password, email, fullname, phone, gender, birthdate }
    // ----------------------------------------------------------
    public static function register(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['username']) || empty($data['password']) || empty($data['fullname']) || empty($data['email'])) {
            Response::error('Tous les champs sont requis.', 422);
        }

        $pdo = Database::getInstance();

        // Check username uniqueness
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt->execute([strtolower(trim($data['username']))]);
        if ($stmt->fetchColumn() > 0) {
            Response::error("Ce nom d'utilisateur est déjà utilisé.", 409);
        }

        // Check email uniqueness across all tables
        require_once __DIR__ . '/../helpers/UserValidationHelper.php';
        if (UserValidationHelper::isEmailDuplicate($data['email'])) {
            Response::error("البريد الإلكتروني مستخدم مسبقًا", 409);
        }

        // Check phone uniqueness across all tables (if provided)
        if (!empty($data['phone']) && UserValidationHelper::isPhoneDuplicate($data['phone'])) {
            Response::error("رقم الهاتف مستخدم مسبقًا", 409);
        }

        // Generate OTP and save to verifications table
        require_once __DIR__ . '/../helpers/UUIDHelper.php';
        $otpCode = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $verifyId = UUIDHelper::generate();

        // حذف رموز التحقق القديمة لهذا الإيميل (بجميع الأنواع القديمة والجديدة)
        $pdo->prepare("DELETE FROM verifications WHERE target = ? AND type IN ('email_reg', 'email_regi', 'email')")->execute([$data['email']]);

        // إدخال رمز التحقق — نستخدم NOW() لضمان اتساق التوقيت مع MySQL Server
        $pdo->prepare("
            INSERT INTO verifications (id, user_id, type, target, code, expires_at, verified)
            VALUES (?, NULL, 'email_reg', ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0)
        ")->execute([$verifyId, $data['email'], $otpCode]);

        // Send OTP via Email
        require_once __DIR__ . '/../helpers/EmailHelper.php';
        if (class_exists('EmailHelper') && method_exists('EmailHelper', 'sendOTP')) {
             EmailHelper::sendOTP($data['email'], trim($data['fullname']), $otpCode);
        } else {
             $subject = "🔐 Code de vérification — Tabibi طبيبي";
             $body = "<p>مرحباً " . trim($data['fullname']) . "،</p><p>رمز التحقق الخاص بك هو: <strong>$otpCode</strong></p>";
             $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: no-reply@webtabibi.com\r\n";
             @mail($data['email'], $subject, $body, $headers);
        }

        Response::success([
            'email' => $data['email'],
            'requires_verification' => true
        ], 'يرجى تأكيد البريد الإلكتروني لإتمام إنشاء الحساب.', 200);
    }

    // ----------------------------------------------------------
    // POST /api/auth/register-confirm
    // Body: { registration_data..., code: '123456' }
    // ----------------------------------------------------------
    public static function registerConfirm(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['email']) || empty($data['code'])) {
            Response::error('البريد الإلكتروني ورمز التحقق مطلوبان', 422);
        }

        $pdo = Database::getInstance();
        $email = trim($data['email']);
        $code = trim($data['code']);

        // التحقق من رمز OTP وصلاحيته — يدعم النوعين القديم والجديد لضمان التوافق
        $stmt = $pdo->prepare("
            SELECT id FROM verifications
            WHERE target = ? AND type IN ('email_reg', 'email_regi') AND code = ?
              AND verified = 0 AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute([$email, $code]);
        $verification = $stmt->fetch();

        if (!$verification) {
            Response::error('رمز التحقق غير صحيح أو منتهي الصلاحية', 400);
        }

        // Verify uniqueness again just in case
        require_once __DIR__ . '/../helpers/UserValidationHelper.php';
        if (UserValidationHelper::isEmailDuplicate($email)) {
            Response::error("البريد الإلكتروني مستخدم مسبقًا", 409);
        }

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt->execute([strtolower(trim($data['username']))]);
        if ($stmt->fetchColumn() > 0) {
            Response::error("Ce nom d'utilisateur est déjà utilisé.", 409);
        }

        // إنشاء الحساب ووضع verified = 1 داخل نفس الـ Transaction
        // حتى إذا فشل إنشاء الحساب، يُعاد الرمز إلى verified = 0 تلقائياً
        $passwordEncoded = base64_encode($data['password']);
        require_once __DIR__ . '/../helpers/UUIDHelper.php';
        $userId    = UUIDHelper::generate();
        $patientId = UUIDHelper::generate();

        $pdo->beginTransaction();
        try {
            // ✅ Mark OTP as verified داخل الـ Transaction
            $pdo->prepare("UPDATE verifications SET verified = 1 WHERE id = ?")->execute([$verification['id']]);

            // Insert User
            $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,0)")
                ->execute([$userId, strtolower(trim($data['username'])), $passwordEncoded]);

            // Insert Patient with emailvalidation = 1
            $pdo->prepare("
                INSERT INTO patients (id, Reference, fullname, phone, email, birthdate, gender, user_id, country, DeleteAcount, nin, emailvalidation)
                VALUES (?, '', ?, ?, ?, ?, ?, ?, 'Algérie', 0, ?, 1)
            ")->execute([
                $patientId,
                trim($data['fullname']),
                $data['phone'] ?? '',
                $email,
                $data['birthdate'] ?? null,
                isset($data['gender']) ? (int)$data['gender'] : 0,
                $userId,
                $data['nin'] ?? null,
            ]);

            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            // ✅ عند الفشل يُعاد rollBack لكل شيء بما فيه verified = 1
            Response::serverError('Erreur lors de la création du compte: ' . $e->getMessage());
        }

        // Auto login since verified
        $token = self::createSession($userId);

        Response::success([
            'token'      => $token,
            'user_type'  => 0,
            'user_id'    => $userId,
            'patient_id' => $patientId,
            'fullname'   => trim($data['fullname']),
            'email'      => $email
        ], 'تم إنشاء الحساب بنجاح.', 201);
    }

    // ----------------------------------------------------------
    // POST /api/auth/login
    // Body: { username, password }
    // ----------------------------------------------------------
    public static function login(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['username']) || empty($data['password'])) {
            Response::error("Nom d'utilisateur et mot de passe requis.", 422);
        }

        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([strtolower(trim($data['username']))]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error("Nom d'utilisateur ou mot de passe incorrect.", 401);
        }

        // Verify password (base64 encoded)
        $encoded = base64_encode($data['password']);
        if ($user['password'] !== $encoded) {
            Response::error("Nom d'utilisateur ou mot de passe incorrect.", 401);
        }

        // Fetch profile info based on usertype
        $profile = [];
        $usertype = (int)$user['usertype'];

        if ($usertype === 0) {
            // Patient
            $stmt = $pdo->prepare("SELECT * FROM patients WHERE user_id = ? LIMIT 1");
            $stmt->execute([$user['id']]);
            $profile = $stmt->fetch() ?: [];
            
            // CHECK EMAIL VALIDATION (تحقق من تأكيد الإيميل)
            if (isset($profile['emailvalidation']) && (int)$profile['emailvalidation'] === 0) {
                self::sendEmailVerificationOTP($pdo, $profile['id'] ?? '', $profile['email'] ?? '', $profile['fullname'] ?? '');
                Response::error("يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول", 403, [
                    'requires_verification' => true,
                    'email' => $profile['email'] ?? ''
                ]);
            }
            
            unset($profile['photoprofile']);
        } elseif ($usertype === 1) {
            // Doctor — check status
            $stmt = $pdo->prepare("SELECT * FROM doctors WHERE user_id = ? LIMIT 1");
            $stmt->execute([$user['id']]);
            $profile = $stmt->fetch() ?: [];
            
            // CHECK EMAIL VALIDATION (تحقق من تأكيد الإيميل)
            if (isset($profile['emailvalidation']) && (int)$profile['emailvalidation'] === 0) {
                self::sendEmailVerificationOTP($pdo, $profile['id'] ?? '', $profile['email'] ?? '', $profile['fullname'] ?? '');
                Response::error("يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول", 403, [
                    'requires_verification' => true,
                    'email' => $profile['email'] ?? ''
                ]);
            }

            if (!empty($profile['status']) && $profile['status'] !== 'APPROVED') {
                Response::error('Compte non approuvé', 403);
            }
            unset($profile['photoprofile']);

            // Fetch clinics the doctor works at
            if (!empty($profile['id'])) {
                $stmtClinics = $pdo->prepare("
                    SELECT c.id, c.clinicname, c.address, c.phone, cd.specialtie_id,
                           s.namefr as specialtyfr, s.namear as specialtyar
                    FROM clinicsdoctors cd
                    JOIN clinics c ON c.id = cd.clinic_id
                    LEFT JOIN specialties s ON s.id = cd.specialtie_id
                    WHERE cd.doctor_id = ? AND cd.status IN ('APPROVED', 'ACCEPTED')
                    ORDER BY c.clinicname
                ");
                $stmtClinics->execute([$profile['id']]);
                $profile['clinics'] = $stmtClinics->fetchAll();
            }
        } elseif ($usertype === 2) {
            $stmt = $pdo->prepare("SELECT * FROM clinics WHERE user_id = ? LIMIT 1");
            $stmt->execute([$user['id']]);
            $clinic = $stmt->fetch();
            if (!$clinic) {
                $profile = ['user_type_label' => 'clinic'];
            } else {
                // CHECK EMAIL VALIDATION (تحقق من تأكيد الإيميل)
                if (isset($clinic['emailvalidation']) && (int)$clinic['emailvalidation'] === 0) {
                    self::sendEmailVerificationOTP($pdo, $clinic['id'] ?? '', $clinic['email'] ?? '', $clinic['clinicname'] ?? '');
                    Response::error("يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول", 403, [
                        'requires_verification' => true,
                        'email' => $clinic['email'] ?? ''
                    ]);
                }
                
                unset($clinic['logo']);
                $profile = $clinic;
            }
        } elseif ($usertype === 3) {
            // Admin
            $profile = ['user_type_label' => 'admin', 'username' => $user['username']];
        }

        $token = self::createSession($user['id']);

        Response::success([
            'token'     => $token,
            'user_type' => $usertype,
            'user_id'   => $user['id'],
            'username'  => $user['username'],
            'profile'   => $profile,
        ], 'Connexion réussie');
    }

    // ----------------------------------------------------------
    // POST /api/auth/google
    // Body: { credential }
    // ----------------------------------------------------------
    public static function google(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['credential'])) {
            Response::error("Credential manquant", 400);
        }

        // Verify with Google
        $ch = curl_init("https://oauth2.googleapis.com/tokeninfo?id_token=" . $data['credential']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $res = curl_exec($ch);
        curl_close($ch);

        $info = json_decode($res, true);
        if (!$info || !isset($info['email']) || empty($info['email_verified']) || $info['email_verified'] === 'false') {
            Response::error("Authentification Google échouée", 401);
        }

        $email = $info['email'];
        $fullname = $info['name'] ?? explode('@', $email)[0];
        
        $pdo = Database::getInstance();
        require_once __DIR__ . '/../helpers/UserValidationHelper.php';

        // Check if email exists ANYWHERE
        if (UserValidationHelper::isEmailDuplicate($email)) {
            // Email exists. We need to check if it belongs to a patient or other user type
            // Google Login only supports Patient login currently in this flow
            $stmt = $pdo->prepare("SELECT * FROM patients WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $patient = $stmt->fetch();
            
            if ($patient) {
                // User exists as Patient, log them in
                $userId = $patient['user_id'];
                $stmtUser = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
                $stmtUser->execute([$userId]);
                $user = $stmtUser->fetch();

                if (!$user) {
                    Response::error("Erreur d'intégrité du compte", 500);
                }
                
                // Set emailvalidation = 1 if it isn't already, since they verified via Google
                if (isset($patient['emailvalidation']) && (int)$patient['emailvalidation'] === 0) {
                    $pdo->prepare("UPDATE patients SET emailvalidation = 1 WHERE id = ?")->execute([$patient['id']]);
                    $patient['emailvalidation'] = 1;
                }

                $token = self::createSession($userId);
                
                $profile = $patient;
                unset($profile['photoprofile']);

                Response::success([
                    'token'     => $token,
                    'user_type' => (int)$user['usertype'],
                    'user_id'   => $userId,
                    'username'  => $user['username'],
                    'profile'   => $profile,
                ], 'Connexion réussie via Google');
                return;
            } else {
                // Exists in doctors or clinics or somewhere else
                Response::error("البريد الإلكتروني مستخدم مسبقًا في حساب آخر.", 409);
            }
        }

        // User does not exist, register them
        $baseUsername = strtolower(explode('@', $email)[0]);
        // Remove special chars for username
        $baseUsername = preg_replace('/[^a-z0-9]/', '', $baseUsername);
        if (empty($baseUsername)) $baseUsername = 'user';
        
        $username = $baseUsername;
        $suffix = 1;
        while (true) {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
            $stmt->execute([$username]);
            if ($stmt->fetchColumn() == 0) break;
            $username = $baseUsername . $suffix;
            $suffix++;
        }

        $passwordEncoded = base64_encode(bin2hex(random_bytes(10))); // Random password
        $userId    = UUIDHelper::generate();
        $patientId = UUIDHelper::generate();

        $pdo->beginTransaction();
        try {
            // Insert User
            $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,0)")
                ->execute([$userId, $username, $passwordEncoded]);

            // Insert Patient with emailvalidation = 1
            $pdo->prepare("
                INSERT INTO patients (id, Reference, fullname, phone, email, birthdate, gender, user_id, country, DeleteAcount, emailvalidation)
                VALUES (?, '', ?, '', ?, NULL, 0, ?, 'Algérie', 0, 1)
            ")->execute([
                $patientId,
                $fullname,
                $email,
                $userId,
            ]);

            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            Response::serverError('Erreur lors de la création du compte via Google: ' . $e->getMessage());
        }

        $token = self::createSession($userId);

        Response::success([
            'token'      => $token,
            'user_type'  => 0,
            'user_id'    => $userId,
            'patient_id' => $patientId,
            'username'   => $username,
            'profile'    => ['fullname' => $fullname, 'email' => $email],
        ], 'Compte créé avec succès via Google', 201);
    }

    // ----------------------------------------------------------
    // POST /api/auth/logout
    // ----------------------------------------------------------
    public static function logout(): void {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';
        $session = AuthMiddleware::authenticate();

        // متوافق مع Apache Module و CGI و FastCGI
        $authHeader = $_SERVER['HTTP_AUTHORIZATION']
                   ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
                   ?? '';
        if (!$authHeader && function_exists('getallheaders')) {
            $hdrs = getallheaders();
            $authHeader = $hdrs['Authorization'] ?? $hdrs['authorization'] ?? '';
        }
        preg_match('/Bearer\s+(.+)/i', $authHeader, $matches);
        $token = trim($matches[1] ?? '');

        Database::getInstance()->prepare("DELETE FROM sessions WHERE token = ?")->execute([$token]);
        Response::success(null, 'Déconnecté avec succès');
    }

    // ----------------------------------------------------------
    // GET /api/auth/me
    // ----------------------------------------------------------
    public static function me(): void {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';
        $session = AuthMiddleware::authenticate();
        $pdo     = Database::getInstance();
        $userId  = $session['user_id'];

        $usertype = (int)$session['usertype'];
        $profile = null;

        if ($usertype === 0) {
            $stmt = $pdo->prepare("SELECT * FROM patients WHERE user_id = ? LIMIT 1");
            $stmt->execute([$userId]);
            $profile = $stmt->fetch() ?: [];
            unset($profile['photoprofile']);
        } elseif ($usertype === 1) {
            $stmt = $pdo->prepare("SELECT * FROM doctors WHERE user_id = ? LIMIT 1");
            $stmt->execute([$userId]);
            $profile = $stmt->fetch() ?: [];
            unset($profile['photoprofile']);
            
            // Fetch clinics for the doctor
            if (!empty($profile['id'])) {
                $stmtClinics = $pdo->prepare("
                    SELECT c.id, c.clinicname, c.address, c.phone, cd.specialtie_id,
                           s.namefr as specialtyfr, s.namear as specialtyar
                    FROM clinicsdoctors cd
                    JOIN clinics c ON c.id = cd.clinic_id
                    LEFT JOIN specialties s ON s.id = cd.specialtie_id
                    WHERE cd.doctor_id = ? AND cd.status IN ('APPROVED', 'ACCEPTED')
                    ORDER BY c.clinicname
                ");
                $stmtClinics->execute([$profile['id']]);
                $profile['clinics'] = $stmtClinics->fetchAll();
            }
        } elseif ($usertype === 2) {
            $stmt = $pdo->prepare("SELECT * FROM clinics WHERE user_id = ? LIMIT 1");
            $stmt->execute([$userId]);
            $profile = $stmt->fetch() ?: [];
            unset($profile['logo']);
        } elseif ($usertype === 3) {
            $stmt = $pdo->prepare("SELECT id, username FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$userId]);
            $profile = $stmt->fetch() ?: [];
        }

        Response::success([
            'user_type' => $usertype,
            'user_id'   => $userId,
            'profile'   => $profile,
            'username'  => $session['username'] ?? null
        ]);
    }

    // ----------------------------------------------------------
    // Private: create DB session token
    // ----------------------------------------------------------
    private static function createSession(string $userId): string {
        $token = bin2hex(random_bytes(32));
        $pdo   = Database::getInstance();
        $pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")
            ->execute([$userId, $token]);
        return $token;
    }

    // ----------------------------------------------------------
    // Helper: Find user by email across all roles
    // ----------------------------------------------------------
    private static function findUserByEmail(string $email): ?array {
        $pdo = Database::getInstance();
        
        // Check patients
        $stmt = $pdo->prepare("SELECT user_id, fullname as name FROM patients WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($row = $stmt->fetch()) return ['user_id' => $row['user_id'], 'name' => $row['name'], 'email' => $email];
        
        // Check doctors
        $stmt = $pdo->prepare("SELECT user_id, fullname as name FROM doctors WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($row = $stmt->fetch()) return ['user_id' => $row['user_id'], 'name' => $row['name'], 'email' => $email];
        
        // Check clinics
        $stmt = $pdo->prepare("SELECT user_id, clinicname as name FROM clinics WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($row = $stmt->fetch()) return ['user_id' => $row['user_id'], 'name' => $row['name'], 'email' => $email];
        
        return null;
    }

    // ----------------------------------------------------------
    // دالة مساعدة لتوليد وإرسال رمز التحقق (OTP) للإيميل عند تسجيل الدخول لحساب غير مؤكد
    // ----------------------------------------------------------
    private static function sendEmailVerificationOTP($pdo, string $profileId, string $email, string $fullname): void {
        require_once __DIR__ . '/../helpers/UUIDHelper.php';
        $otpCode = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $verifyId = UUIDHelper::generate();

        // حذف رموز التحقق القديمة غير المؤكدة لهذا الإيميل
        $pdo->prepare("DELETE FROM verifications WHERE target = ? AND type = 'email'")->execute([$email]);

        // إدخال رمز التحقق — نستخدم DATE_ADD(NOW(), ...) لتجنب فارق التوقيت بين PHP والسيرفر
        $pdo->prepare("
            INSERT INTO verifications (id, user_id, type, target, code, expires_at, verified)
            VALUES (?, ?, 'email', ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0)
        ")->execute([$verifyId, $profileId, $email, $otpCode]);

        // إرسال الرمز عبر الإيميل
        require_once __DIR__ . '/../helpers/EmailHelper.php';
        if (class_exists('EmailHelper') && method_exists('EmailHelper', 'sendOTP')) {
            EmailHelper::sendOTP($email, trim($fullname), $otpCode);
        } else {
            $subject = "🔐 Code de vérification — Tabibi طبيبي";
            $body = "<p>مرحباً " . trim($fullname) . "،</p><p>رمز التحقق الخاص بك هو: <strong>$otpCode</strong></p>";
            $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: no-reply@webtabibi.com\r\n";
            @mail($email, $subject, $body, $headers);
        }
    }

    // ----------------------------------------------------------
    // POST /api/auth/forgot-password
    // Body: { email }
    // ----------------------------------------------------------
    public static function forgotPassword(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Email invalide', 422);
        }

        $email = trim($data['email']);
        $user = self::findUserByEmail($email);

        if (!$user) {
            // Return success anyway to prevent email enumeration attacks
            Response::success(null, 'Si l\'email existe, un code de réinitialisation sera envoyé.');
        }

        $pdo = Database::getInstance();
        
        // Delete any existing unused OTPs for this email to prevent spam
        $pdo->prepare("DELETE FROM password_resets WHERE email = ? AND used = 0")->execute([$email]);

        // Generate 6-digit OTP
        $otpCode = sprintf("%06d", mt_rand(1, 999999));
        $resetId = UUIDHelper::generate();
        $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        $pdo->prepare("INSERT INTO password_resets (id, email, otp_code, expires_at, used) VALUES (?, ?, ?, ?, 0)")
            ->execute([$resetId, $email, $otpCode, $expiresAt]);

        require_once __DIR__ . '/../helpers/EmailHelper.php';
        EmailHelper::sendPasswordReset($email, $user['name'], $otpCode);

        Response::success(null, 'Si l\'email existe, un code de réinitialisation sera envoyé.');
    }

    // ----------------------------------------------------------
    // POST /api/auth/verify-account-email
    // Body: { email, code }
    // ----------------------------------------------------------
    public static function verifyAccountEmail(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['email']) || empty($data['code'])) {
            Response::error('البريد الإلكتروني والرمز مطلوبان', 422);
        }

        $email = trim($data['email']);
        $code = trim($data['code']);
        $pdo = Database::getInstance();

        // Find the user ID by email in any of the tables
        require_once __DIR__ . '/../helpers/UserValidationHelper.php';
        $user = UserValidationHelper::findUserByEmail($email);
        $userId = null;
        $tableToUpdate = null;

        if ($user) {
            $userId = $user['user_id'];
            if ($user['type'] === 'patient') $tableToUpdate = 'patients';
            elseif ($user['type'] === 'doctor') $tableToUpdate = 'doctors';
            elseif ($user['type'] === 'clinic') $tableToUpdate = 'clinics';
        } else {
            // Also check registrations tables for doctors/clinics pending
            $stmt = $pdo->prepare("SELECT id FROM clinicregistrations WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            if ($row = $stmt->fetch()) {
                $userId = $row['id'];
                $tableToUpdate = 'clinicregistrations'; // we might not have emailvalidation here, just mark verification
            } else {
                $stmt = $pdo->prepare("SELECT id FROM doctorregistrations WHERE email = ? LIMIT 1");
                $stmt->execute([$email]);
                if ($row = $stmt->fetch()) {
                    $userId = $row['id'];
                    $tableToUpdate = 'doctorregistrations';
                }
            }
        }

        if (!$userId) {
            Response::error('المستخدم غير موجود', 404);
        }

        // التحقق من الرمز باستخدام الإيميل مباشرة لتفادي أي تعارض في المعرفات
        $stmt = $pdo->prepare("
            SELECT * FROM verifications
            WHERE target = ? AND type = 'email' AND code = ?
              AND verified = 0 AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute([$email, $code]);
        $verification = $stmt->fetch();

        if (!$verification) {
            Response::error('الرمز غير صحيح أو منتهي الصلاحية', 400);
        }

        // Mark OTP as used
        $pdo->prepare("UPDATE verifications SET verified = 1 WHERE id = ?")->execute([$verification['id']]);

        // Update validation field if applicable
        if (in_array($tableToUpdate, ['patients', 'doctors', 'clinics'])) {
            $pdo->prepare("UPDATE `$tableToUpdate` SET emailvalidation = 1 WHERE email = ?")->execute([$email]);
        }
        
        Response::success(null, 'تم تأكيد البريد الإلكتروني بنجاح');
    }

    // ----------------------------------------------------------
    // POST /api/auth/verify-otp
    // Body: { email, otp }
    // ----------------------------------------------------------
    public static function verifyOtp(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['email']) || empty($data['otp'])) {
            Response::error('Email et code OTP requis', 422);
        }

        $email = trim($data['email']);
        $otp = trim($data['otp']);

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM password_resets WHERE email = ? AND otp_code = ? AND used = 0 AND expires_at > NOW() LIMIT 1");
        $stmt->execute([$email, $otp]);
        
        if (!$stmt->fetch()) {
            Response::error('Code OTP invalide ou expiré', 400);
        }

        Response::success(null, 'Code OTP valide');
    }

    // ----------------------------------------------------------
    // POST /api/auth/reset-password
    // Body: { email, otp, password }
    // ----------------------------------------------------------
    public static function resetPassword(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['email']) || empty($data['otp']) || empty($data['password'])) {
            Response::error('Données incomplètes', 422);
        }

        $email = trim($data['email']);
        $otp = trim($data['otp']);
        $password = $data['password'];

        $pdo = Database::getInstance();
        
        // Verify OTP again just in case
        $stmt = $pdo->prepare("SELECT id FROM password_resets WHERE email = ? AND otp_code = ? AND used = 0 AND expires_at > NOW() LIMIT 1");
        $stmt->execute([$email, $otp]);
        $resetRecord = $stmt->fetch();
        
        if (!$resetRecord) {
            Response::error('Code OTP invalide ou expiré', 400);
        }

        $user = self::findUserByEmail($email);
        if (!$user) {
            Response::error('Utilisateur non trouvé', 404);
        }

        // Update password in users table
        $passwordEncoded = base64_encode($password);
        $pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$passwordEncoded, $user['user_id']]);

        // Mark OTP as used
        $pdo->prepare("UPDATE password_resets SET used = 1 WHERE id = ?")->execute([$resetRecord['id']]);

        // Invalidate all existing sessions to force re-login
        $pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$user['user_id']]);

        Response::success(null, 'Mot de passe réinitialisé avec succès');
    }
}
