<?php
// ============================================================
// controllers/AuthController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';
require_once __DIR__ . '/../helpers/PasswordHelper.php';
require_once __DIR__ . '/../helpers/ConsentHelper.php';

class AuthController {

    // ----------------------------------------------------------
    // POST /api/auth/register
    // Body: { username, password, email, fullname, phone, gender, birthdate }
    // ----------------------------------------------------------
    public static function register(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['username']) || empty($data['password']) || empty($data['fullname']) || empty($data['email'])) {
            // رسالة بشرية: حقول ناقصة عند التسجيل
            Response::error('يرجى ملء جميع الحقول المطلوبة (الاسم الكامل، اسم المستخدم، البريد الإلكتروني، كلمة المرور) قبل المتابعة.', 422);
        }

        // PHASE 02C : Validation du consentement obligatoire (Art. 6, 9, 32 Loi 18-07)
        // Les cases CGU et Politique de confidentialité doivent être cochées explicitement
        if (empty($data['consent_cgu']) || empty($data['consent_privacy'])) {
            Response::error('يجب قبول شروط الاستخدام وسياسة الخصوصية للمتابعة. (Art. 6 Loi 18-07)', 422);
        }

        $pdo = Database::getInstance();

        // Check username uniqueness
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt->execute([strtolower(trim($data['username']))]);
        if ($stmt->fetchColumn() > 0) {
            // رسالة بشرية: اسم مستخدم مكرر
            Response::error("اسم المستخدم هذا محجوز من قبل. يرجى اختيار اسم مستخدم آخر.", 409);
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
            // رسالة بشرية: رمز OTP خاطئ أو منتهي
            Response::error('الرمز الذي أدخلته غير صحيح أو انتهت صلاحيته. يرجى طلب رمز جديد والمحاولة مرة أخرى.', 400);
        }

        // Verify uniqueness again just in case
        require_once __DIR__ . '/../helpers/UserValidationHelper.php';
        if (UserValidationHelper::isEmailDuplicate($email)) {
            Response::error("البريد الإلكتروني مستخدم مسبقًا", 409);
        }

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt->execute([strtolower(trim($data['username']))]);
        if ($stmt->fetchColumn() > 0) {
            // رسالة بشرية: اسم مستخدم مكرر عند التأكيد
            Response::error("اسم المستخدم هذا أصبح محجوزاً. يرجى اختيار اسم مستخدم آخر.", 409);
        }

        // إنشاء الحساب ووضع verified = 1 داخل نفس الـ Transaction
        // حتى إذا فشل إنشاء الحساب، يُعاد الرمز إلى verified = 0 تلقائياً
        // PHASE 02B : Nouveau mot de passe hashé avec Bcrypt (password_hash)
        $passwordHashed = PasswordHelper::hash($data['password']);
        require_once __DIR__ . '/../helpers/UUIDHelper.php';
        $userId    = UUIDHelper::generate();
        $patientId = UUIDHelper::generate();

        $pdo->beginTransaction();
        try {
            // ✅ Mark OTP as verified داخل الـ Transaction
            $pdo->prepare("UPDATE verifications SET verified = 1 WHERE id = ?")->execute([$verification['id']]);

            // Insert User
            $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,0)")
                ->execute([$userId, strtolower(trim($data['username'])), $passwordHashed]);

            // PHASE 02C : Enregistrement des consentements dans patients (preuve directe)
            $consentCgu     = !empty($data['consent_cgu'])     ? 1 : 0;
            $consentPrivacy = !empty($data['consent_privacy']) ? 1 : 0;
            $consentVersion = ConsentHelper::DOC_VERSION;
            $consentAt      = date('Y-m-d H:i:s');

            // Insert Patient with emailvalidation = 1 and phonevalidation = 1
            $pdo->prepare("
                INSERT INTO patients (id, Reference, fullname, phone, email, birthdate, gender, user_id, country, DeleteAcount, nin, emailvalidation, phonevalidation, consent_cgu, consent_privacy, consent_version, consent_at)
                VALUES (?, '', ?, ?, ?, ?, ?, ?, 'Algérie', 0, ?, 1, 1, ?, ?, ?, ?)
            ")->execute([
                $patientId,
                trim($data['fullname']),
                $data['phone'] ?? '',
                $email,
                $data['birthdate'] ?? null,
                isset($data['gender']) ? (int)$data['gender'] : 0,
                $userId,
                $data['nin'] ?? null,
                $consentCgu,
                $consentPrivacy,
                $consentVersion,
                $consentAt,
            ]);

            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            // ✅ عند الفشل يُعاد rollBack لكل شيء بما فيه verified = 1
            // رسالة بشرية: خطأ داخلي عند إنشاء الحساب
            Response::serverError('حدث خطأ أثناء إنشاء حسابك. يرجى المحاولة مرة أخرى. إذا استمرت المشكلة يرجى التواصل مع الدعم الفني.');
        }

        // PHASE 02C : Enregistrement dans consent_logs après le commit
        ConsentHelper::logMultiple($pdo, $userId, $patientId, [
            ConsentHelper::TYPE_CGU      => !empty($data['consent_cgu'])     ? 1 : 0,
            ConsentHelper::TYPE_PRIVACY  => !empty($data['consent_privacy']) ? 1 : 0,
        ], 'registration');

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
            // رسالة بشرية: حقول تسجيل الدخول ناقصة
            Response::error("يرجى إدخال اسم المستخدم وكلمة المرور للمتابعة.", 422);
        }

        $pdo  = Database::getInstance();
        $identifier = strtolower(trim($data['username'])); // Can be username, email, or phone

        // Rate Limiting — Protection brute-force et credential stuffing
        require_once __DIR__ . '/../helpers/RateLimiter.php';
        $ip = RateLimiter::getClientIp();
        $accountKey = 'user:' . hash('sha256', $identifier);

        $ipBlock = RateLimiter::check($ip, 'login_ip');
        if ($ipBlock) {
            $minutes = (int)ceil($ipBlock['retry_after'] / 60);
            header('Retry-After: ' . $ipBlock['retry_after']);
            Response::error("Trop de tentatives de connexion depuis cette adresse. Veuillez réessayer dans {$minutes} minute(s).", 429, [
                'retry_after' => $ipBlock['retry_after']
            ]);
        }

        $accountBlock = RateLimiter::check($accountKey, 'login_account');
        if ($accountBlock) {
            $minutes = (int)ceil($accountBlock['retry_after'] / 60);
            header('Retry-After: ' . $accountBlock['retry_after']);
            Response::error("Ce compte est temporairement verrouillé suite à plusieurs échecs de connexion. Veuillez réessayer dans {$minutes} minute(s).", 429, [
                'retry_after' => $accountBlock['retry_after']
            ]);
        }

        // 1. Try to find by username
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([$identifier]);
        $user = $stmt->fetch();

        // 2. If not found by username, try to find by validated email or validated phone
        if (!$user) {
            $userId = null;
            
            // Patients
            $stmt = $pdo->prepare("SELECT user_id FROM patients WHERE (email = ? AND emailvalidation = 1) OR (phone = ? AND phonevalidation = 1) LIMIT 1");
            $stmt->execute([$identifier, $identifier]);
            if ($row = $stmt->fetch()) $userId = $row['user_id'];

            // Doctors
            if (!$userId) {
                $stmt = $pdo->prepare("SELECT user_id FROM doctors WHERE (email = ? AND emailvalidation = 1) OR (phone = ? AND phonevalidation = 1) LIMIT 1");
                $stmt->execute([$identifier, $identifier]);
                if ($row = $stmt->fetch()) $userId = $row['user_id'];
            }

            // Clinics
            if (!$userId) {
                $stmt = $pdo->prepare("SELECT user_id FROM clinics WHERE (email = ? AND emailvalidation = 1) OR (phone = ? AND phonevalidation = 1) LIMIT 1");
                $stmt->execute([$identifier, $identifier]);
                if ($row = $stmt->fetch()) $userId = $row['user_id'];
            }

            // If we found a valid user_id via email/phone, fetch the user record
            if ($userId) {
                $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
                $stmt->execute([$userId]);
                $user = $stmt->fetch();
            }
        }

        if (!$user) {
            RateLimiter::hit($ip, 'login_ip', 5, 300, 900);
            RateLimiter::hit($accountKey, 'login_account', 5, 900, 900);
            // رسالة بشرية: اسم مستخدم أو كلمة مرور خاطئة
            Response::error("اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق من المعلومات والمحاولة مجدداً.", 401);
        }

        // PHASE 02B : Vérification duale (legacy Base64 + Bcrypt) avec migration silencieuse
        if (!PasswordHelper::verify($data['password'], $user['password'])) {
            RateLimiter::hit($ip, 'login_ip', 5, 300, 900);
            RateLimiter::hit($accountKey, 'login_account', 5, 900, 900);
            // رسالة بشرية: كلمة المرور غير متطابقة
            Response::error("اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق من المعلومات والمحاولة مجدداً.", 401);
        }

        // Migration silencieuse : si l'ancien format est détecté, on rehash immédiatement
        if (PasswordHelper::needsMigration($user['password'])) {
            $newHash = PasswordHelper::hash($data['password']);
            $pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$newHash, $user['id']]);
        }

        // Fetch profile info based on usertype
        $profile = [];
        $usertype = (int)$user['usertype'];

        if ($usertype === 0) {
            // Patient
            $stmt = $pdo->prepare("SELECT * FROM patients WHERE user_id = ? LIMIT 1");
            $stmt->execute([$user['id']]);
            $profile = $stmt->fetch() ?: [];
            
            // CHECK ACCOUNT DELETION (تحقق من عدم حذف الحساب)
            if (!empty($profile['deleteacount'])) {
                Response::error("هذا الحساب تم حذفه بناءً على طلب صاحبه.", 403);
            }

            // CHECK FROZEN STATUS (تحقق من تجميد الحساب)
            if (!empty($profile['is_frozen'])) {
                $reasonMsg = !empty($profile['freeze_reason']) ? (" سبب التجميد: " . $profile['freeze_reason']) : "";
                Response::error("تم تجميد هذا الحساب من قِبَل الإدارة.{$reasonMsg} يرجى التواصل مع الدعم الفني.", 403, [
                    'is_frozen' => true,
                    'freeze_reason' => $profile['freeze_reason'] ?? null
                ]);
            }

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
                // رسالة بشرية: حساب الطبيب لم يتم اعتماده بعد
                Response::error('حسابك قيد المراجعة من قِبَل الإدارة. ستتلقى إشعاراً بالبريد الإلكتروني عند الموافقة على طلبك.', 403);
            }

            // CHECK FROZEN STATUS (تحقق من تجميد الاشتراك)
            if (!empty($profile['is_frozen'])) {
                $reasonMsg = !empty($profile['freeze_reason']) ? (" سبب التجميد: " . $profile['freeze_reason']) : "";
                Response::error("تم تجميد اشتراك وحسابك الطبي من قِبَل الإدارة.{$reasonMsg} يرجى التواصل مع الدعم الفني.", 403, [
                    'is_frozen' => true,
                    'freeze_reason' => $profile['freeze_reason'] ?? null
                ]);
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

                // CHECK FROZEN STATUS (تحقق من تجميد الاشتراك)
                if (!empty($clinic['is_frozen'])) {
                    $reasonMsg = !empty($clinic['freeze_reason']) ? (" سبب التجميد: " . $clinic['freeze_reason']) : "";
                    Response::error("تم تجميد اشتراك وحساب العيادة من قِبَل الإدارة.{$reasonMsg} يرجى التواصل مع الدعم الفني.", 403, [
                        'is_frozen' => true,
                        'freeze_reason' => $clinic['freeze_reason'] ?? null
                    ]);
                }
                
                unset($clinic['logo']);
                unset($clinic['password']);
                $profile = $clinic;
            }
        } elseif ($usertype === 3) {
            // Admin
            $profile = ['user_type_label' => 'admin', 'username' => $user['username']];
        } elseif ($usertype === 4) {
            // Support
            $profile = ['user_type_label' => 'support', 'username' => $user['username']];
        }

        $token = self::createSession($user['id']);

        // Réinitialisation des compteurs de tentatives après succès
        RateLimiter::reset($ip, 'login_ip');
        RateLimiter::reset($accountKey, 'login_account');

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
            // رسالة بشرية: بيانات Google مفقودة
            Response::error("تعذر التحقق من حسابك على Google. يرجى المحاولة مرة أخرى.", 400);
        }

        // Verify with Google (SSL verification enabled for production security)
        $ch = curl_init("https://oauth2.googleapis.com/tokeninfo?id_token=" . $data['credential']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        $res = curl_exec($ch);
        curl_close($ch);

        $info = json_decode($res, true);
        if (!$info || !isset($info['email']) || empty($info['email_verified']) || $info['email_verified'] === 'false') {
            // رسالة بشرية: فشل التحقق من حساب Google
            Response::error("تعذر التحقق من هويتك عبر Google. تأكد من أن حساب Google الخاص بك مفعّل وحاول مرة أخرى.", 401);
        }

        $email = $info['email'];
        $fullname = $info['name'] ?? explode('@', $email)[0];
        
        $pdo = Database::getInstance();
        require_once __DIR__ . '/../helpers/UserValidationHelper.php';

        // Check if email exists ANYWHERE
        if (UserValidationHelper::isEmailDuplicate($email)) {
            // 1. Check if it belongs to a patient
            $stmt = $pdo->prepare("SELECT * FROM patients WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $patient = $stmt->fetch();
            
            if ($patient) {
                if (!empty($patient['deleteacount'])) {
                    Response::error("هذا الحساب تم حذفه بناءً على طلب صاحبه.", 403);
                }

                // User exists as Patient, log them in
                $userId = $patient['user_id'];
                $stmtUser = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
                $stmtUser->execute([$userId]);
                $user = $stmtUser->fetch();

                if (!$user) {
                    // رسالة بشرية: خطأ في بيانات الحساب
                    Response::error("حدث خطأ في بيانات حسابك. يرجى التواصل مع الدعم الفني للمساعدة.", 500);
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
            }

            // 2. Check if it belongs to a doctor
            $stmt = $pdo->prepare("SELECT * FROM doctors WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $doctor = $stmt->fetch();

            if ($doctor) {
                if (!empty($doctor['deleteacount'])) {
                    Response::error("هذا الحساب تم حذفه بناءً على طلب صاحبه.", 403);
                }

                if (!empty($doctor['status']) && $doctor['status'] !== 'APPROVED') {
                    // رسالة بشرية: حساب الطبيب لم يتم اعتماده بعد
                    Response::error('حسابك قيد المراجعة من قِبَل الإدارة. ستتلقى إشعاراً بالبريد الإلكتروني عند الموافقة على طلبك.', 403);
                }

                $userId = $doctor['user_id'];
                $stmtUser = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
                $stmtUser->execute([$userId]);
                $user = $stmtUser->fetch();

                if (!$user) {
                    Response::error("حدث خطأ في بيانات حسابك. يرجى التواصل مع الدعم الفني للمساعدة.", 500);
                }

                // Set emailvalidation = 1 if it isn't already, since they verified via Google
                if (isset($doctor['emailvalidation']) && (int)$doctor['emailvalidation'] === 0) {
                    $pdo->prepare("UPDATE doctors SET emailvalidation = 1 WHERE id = ?")->execute([$doctor['id']]);
                    $doctor['emailvalidation'] = 1;
                }

                $token = self::createSession($userId);

                $profile = $doctor;
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

                Response::success([
                    'token'     => $token,
                    'user_type' => (int)$user['usertype'],
                    'user_id'   => $userId,
                    'username'  => $user['username'],
                    'profile'   => $profile,
                ], 'Connexion réussie via Google');
                return;
            }

            // 3. Check if it belongs to a clinic
            $stmt = $pdo->prepare("SELECT * FROM clinics WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $clinic = $stmt->fetch();

            if ($clinic) {
                $userId = $clinic['user_id'];
                $stmtUser = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
                $stmtUser->execute([$userId]);
                $user = $stmtUser->fetch();

                if (!$user) {
                    Response::error("حدث خطأ في بيانات حسابك. يرجى التواصل مع الدعم الفني للمساعدة.", 500);
                }

                if (isset($clinic['emailvalidation']) && (int)$clinic['emailvalidation'] === 0) {
                    $pdo->prepare("UPDATE clinics SET emailvalidation = 1 WHERE id = ?")->execute([$clinic['id']]);
                    $clinic['emailvalidation'] = 1;
                }

                $token = self::createSession($userId);

                unset($clinic['logo']);
                unset($clinic['password']);
                $profile = $clinic;

                Response::success([
                    'token'     => $token,
                    'user_type' => (int)$user['usertype'],
                    'user_id'   => $userId,
                    'username'  => $user['username'],
                    'profile'   => $profile,
                ], 'Connexion réussie via Google');
                return;
            }

            // 4. Check if pending in doctorregistrations
            $stmt = $pdo->prepare("SELECT * FROM doctorregistrations WHERE email = ? ORDER BY createdat DESC LIMIT 1");
            $stmt->execute([$email]);
            $docReg = $stmt->fetch();
            if ($docReg) {
                if ($docReg['status'] === 'PENDING') {
                    Response::error("طلب تسجيلك كطبيب قيد المراجعة حالياً من قِبَل الإدارة. ستتلقى إشعاراً عند الموافقة.", 403);
                } elseif ($docReg['status'] === 'REJECTED') {
                    Response::error("تم رفض طلب تسجيلك كطبيب سابقاً: " . ($docReg['rejectedreason'] ?? ''), 403);
                }
            }

            // 5. Check if pending in clinicregistrations
            $stmt = $pdo->prepare("SELECT * FROM clinicregistrations WHERE email = ? ORDER BY createdat DESC LIMIT 1");
            $stmt->execute([$email]);
            $clinicReg = $stmt->fetch();
            if ($clinicReg) {
                if ($clinicReg['status'] === 'PENDING') {
                    Response::error("طلب تسجيل العيادة قيد المراجعة حالياً من قِبَل الإدارة.", 403);
                } elseif ($clinicReg['status'] === 'REJECTED') {
                    Response::error("تم رفض طلب تسجيل العيادة سابقاً.", 403);
                }
            }

            Response::error("البريد الإلكتروني مستخدم مسبقًا في حساب آخر.", 409);
        }

        // User does not exist: enforce CGU/Privacy consent before creating account (PHASE 02F - Loi 18-07)
        if (empty($data['accepted_cgu'])) {
            Response::error(
                "يجب قبول شروط الاستخدام وسياسة الخصوصية قبل إنشاء الحساب.",
                422,
                ['requires_consent' => true]
            );
        }

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

        // PHASE 02B : Mot de passe aléatoire hashé en Bcrypt (compte Google, jamais utilisé pour login classique)
        $passwordHashed = PasswordHelper::hash(bin2hex(random_bytes(10)));
        $userId    = UUIDHelper::generate();
        $patientId = UUIDHelper::generate();
        $consentVersion = ConsentHelper::DOC_VERSION;
        $consentAt = date('Y-m-d H:i:s');

        $pdo->beginTransaction();
        try {
            // Insert User
            $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,0)")
                ->execute([$userId, $username, $passwordHashed]);

            // Insert Patient with emailvalidation = 1 and phonevalidation = 1, plus consent proof
            $pdo->prepare("
                INSERT INTO patients (id, Reference, fullname, phone, email, birthdate, gender, user_id, country, DeleteAcount, emailvalidation, phonevalidation, consent_cgu, consent_privacy, consent_version, consent_at)
                VALUES (?, '', ?, '', ?, NULL, 0, ?, 'Algérie', 0, 1, 1, 1, 1, ?, ?)
            ")->execute([
                $patientId,
                $fullname,
                $email,
                $userId,
                $consentVersion,
                $consentAt,
            ]);

            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            // رسالة بشرية: خطأ عند إنشاء حساب Google
            Response::serverError('حدث خطأ أثناء إنشاء حسابك عبر Google. يرجى المحاولة مرة أخرى أو استخدام طريقة تسجيل أخرى.');
        }

        // PHASE 02C : Enregistrement des consentements dans consent_logs
        ConsentHelper::logMultiple($pdo, $userId, $patientId, [
            ConsentHelper::TYPE_CGU     => 1,
            ConsentHelper::TYPE_PRIVACY => 1,
        ], 'google_registration');

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
            unset($profile['password']);
        } elseif ($usertype === 3 || $usertype === 4) {
            $stmt = $pdo->prepare("SELECT id, username FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$userId]);
            $profile = $stmt->fetch() ?: [];
            if ($usertype === 4) {
                $profile['user_type_label'] = 'support';
            }
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
            // رسالة بشرية: بريد إلكتروني غير صالح
            Response::error('يرجى إدخال بريد إلكتروني صحيح (مثال: exemple@gmail.com).', 422);
        }

        $email = strtolower(trim($data['email']));

        // Rate Limiting — Protection anti-spam SMTP et abus (max 3 requêtes par 10 min)
        require_once __DIR__ . '/../helpers/RateLimiter.php';
        $ip = RateLimiter::getClientIp();
        $emailKey = 'forgot:' . hash('sha256', $email);

        $ipBlock = RateLimiter::check($ip, 'forgot_pw_ip');
        if ($ipBlock) {
            $minutes = (int)ceil($ipBlock['retry_after'] / 60);
            header('Retry-After: ' . $ipBlock['retry_after']);
            Response::error("Trop de demandes de réinitialisation depuis votre adresse IP. Veuillez patienter {$minutes} minute(s).", 429, [
                'retry_after' => $ipBlock['retry_after']
            ]);
        }

        $emailBlock = RateLimiter::check($emailKey, 'forgot_pw_email');
        if ($emailBlock) {
            $minutes = (int)ceil($emailBlock['retry_after'] / 60);
            header('Retry-After: ' . $emailBlock['retry_after']);
            Response::error("Trop de demandes de réinitialisation pour cette adresse email. Veuillez patienter {$minutes} minute(s).", 429, [
                'retry_after' => $emailBlock['retry_after']
            ]);
        }

        RateLimiter::hit($ip, 'forgot_pw_ip', 3, 600, 600);
        RateLimiter::hit($emailKey, 'forgot_pw_email', 3, 600, 600);

        $user = self::findUserByEmail($email);

        if (!$user) {
            // Return success anyway to prevent email enumeration attacks
            Response::success(null, 'Si l\'email existe, un code de réinitialisation sera envoyé.');
        }

        $pdo = Database::getInstance();
        
        // Delete any existing unused OTPs for this email to prevent spam
        $pdo->prepare("DELETE FROM password_resets WHERE email = ? AND used = 0")->execute([$email]);

        // Generate 6-digit OTP avec random_int cryptographiquement sécurisé
        $otpCode = sprintf("%06d", random_int(100000, 999999));
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
            // رسالة بشرية: البريد والرمز مطلوبان
            Response::error('يرجى إدخال البريد الإلكتروني ورمز التحقق المرسَل إليك.', 422);
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
            // رسالة بشرية: المستخدم غير موجود
            Response::error('لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني. تأكد من صحة البريد الإلكتروني وحاول مجدداً.', 404);
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
            // رسالة بشرية: رمز التحقق منتهي أو خاطئ
            Response::error('رمز التحقق الذي أدخلته غير صحيح أو انتهت صلاحيته (10 دقائق). يرجى طلب رمز جديد.', 400);
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
            // رسالة بشرية: البريد والرمز مطلوبان عند التحقق من OTP
            Response::error('يرجى إدخال البريد الإلكتروني ورمز التحقق المكوّن من 6 أرقام.', 422);
        }

        $email = strtolower(trim($data['email']));
        $otp = trim($data['otp']);

        // Rate Limiting — Protection anti-brute-force OTP (max 5 tentatives par 15 min)
        require_once __DIR__ . '/../helpers/RateLimiter.php';
        $ip = RateLimiter::getClientIp();
        $emailKey = 'otp:' . hash('sha256', $email);

        $ipBlock = RateLimiter::check($ip, 'otp_verify_ip');
        if ($ipBlock) {
            $minutes = (int)ceil($ipBlock['retry_after'] / 60);
            header('Retry-After: ' . $ipBlock['retry_after']);
            Response::error("Trop de tentatives erronées depuis votre adresse IP. Veuillez réessayer dans {$minutes} minute(s).", 429, [
                'retry_after' => $ipBlock['retry_after']
            ]);
        }

        $emailBlock = RateLimiter::check($emailKey, 'otp_verify_email');
        if ($emailBlock) {
            $minutes = (int)ceil($emailBlock['retry_after'] / 60);
            header('Retry-After: ' . $emailBlock['retry_after']);
            Response::error("Ce code OTP a été invalidé après trop de tentatives erronées. Veuillez demander un nouveau code.", 429, [
                'retry_after' => $emailBlock['retry_after']
            ]);
        }

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM password_resets WHERE email = ? AND otp_code = ? AND used = 0 AND expires_at > NOW() LIMIT 1");
        $stmt->execute([$email, $otp]);
        $validOtp = $stmt->fetch();
        
        if (!$validOtp) {
            RateLimiter::hit($ip, 'otp_verify_ip', 5, 900, 900);
            $hit = RateLimiter::hit($emailKey, 'otp_verify_email', 5, 900, 900);

            // Invalidation définitive de l'OTP en DB si quota d'échecs atteint
            if ($hit['blocked']) {
                $pdo->prepare("UPDATE password_resets SET used = 1 WHERE email = ? AND used = 0")->execute([$email]);
                Response::error("Trop de tentatives erronées. Ce code de réinitialisation a été invalidé pour des raisons de sécurité. Veuillez demander un nouveau code.", 429);
            }

            // رسالة بشرية: رمز OTP منتهي أو غير صحيح عند التحقق
            Response::error('رمز التحقق غير صحيح أو انتهت صلاحيته. يرجى طلب رمز جديد من صفحة استعادة كلمة المرور.', 400);
        }

        // Succès : réinitialisation des échecs OTP
        RateLimiter::reset($ip, 'otp_verify_ip');
        RateLimiter::reset($emailKey, 'otp_verify_email');

        Response::success(null, 'Code OTP valide');
    }

    // ----------------------------------------------------------
    // POST /api/auth/reset-password
    // Body: { email, otp, password }
    // ----------------------------------------------------------
    public static function resetPassword(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['email']) || empty($data['otp']) || empty($data['password'])) {
            // رسالة بشرية: بيانات إعادة تعيين كلمة المرور ناقصة
            Response::error('يرجى تعبئة جميع الحقول: البريد الإلكتروني، رمز التحقق، وكلمة المرور الجديدة.', 422);
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
            // رسالة بشرية: رمز انتهت صلاحيته عند إعادة التعيين
            Response::error('رمز التحقق غير صحيح أو انتهت صلاحيته. يرجى طلب رمز جديد.', 400);
        }

        $user = self::findUserByEmail($email);
        if (!$user) {
            // رسالة بشرية: لم يتم العثور على الحساب عند إعادة تعيين كلمة المرور
            Response::error('لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني.', 404);
        }

        // PHASE 02B : Réinitialisation du mot de passe en Bcrypt (password_hash)
        $passwordHashed = PasswordHelper::hash($password);
        $pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$passwordHashed, $user['user_id']]);

        // Mark OTP as used
        $pdo->prepare("UPDATE password_resets SET used = 1 WHERE id = ?")->execute([$resetRecord['id']]);

        // Invalidate all existing sessions to force re-login
        $pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$user['user_id']]);

        // Nettoyage des rate limits après réinitialisation réussie
        require_once __DIR__ . '/../helpers/RateLimiter.php';
        RateLimiter::reset(RateLimiter::getClientIp(), 'otp_verify_ip');
        RateLimiter::reset('otp:' . hash('sha256', $email), 'otp_verify_email');
        RateLimiter::reset('user:' . hash('sha256', $email), 'login_account');

        Response::success(null, 'Mot de passe réinitialisé avec succès');
    }
}
