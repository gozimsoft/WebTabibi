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

        $required = ['username', 'password', 'email', 'fullname'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Le champ '$field' est requis.", 422);
            }
        }

        // Validate email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('email invalide.', 422);
        }

        $pdo = Database::getInstance();

        // Check username / email uniqueness
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt->execute([strtolower(trim($data['username']))]);
        if ($stmt->fetchColumn() > 0) {
            Response::error("Ce nom d'utilisateur est déjà utilisé.", 409);
        }

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM patients WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetchColumn() > 0) {
            Response::error("Cet email est déjà utilisé.", 409);
        }

        // password: store as base64 for DB compatibility (varchar 50)
        $passwordEncoded = base64_encode($data['password']);

        $userId    = UUIDHelper::generate();
        $patientId = UUIDHelper::generate();

        $pdo->beginTransaction();
        try {
            // Insert User
            $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,0)")
                ->execute([$userId, strtolower(trim($data['username'])), $passwordEncoded]);

            // Insert Patient
            $pdo->prepare("
                INSERT INTO patients (id, Reference, fullname, phone, email, birthdate, gender, user_id, country, DeleteAcount, nin)
                VALUES (?, '', ?, ?, ?, ?, ?, ?, 'Algérie', 0, ?)
            ")->execute([
                $patientId,
                trim($data['fullname']),
                $data['phone'] ?? '',
                $data['email'],
                $data['birthdate'] ?? null,
                isset($data['gender']) ? (int)$data['gender'] : 0,
                $userId,
                $data['nin'] ?? null,
            ]);

            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            Response::serverError('Erreur lors de la création du compte: ' . $e->getMessage());
        }

        // Auto-login: create session token
        $token = self::createSession($userId);

        Response::success([
            'token'      => $token,
            'user_type'  => 0,
            'user_id'    => $userId,
            'patient_id' => $patientId,
            'fullname'   => trim($data['fullname']),
            'email'      => $data['email'],
        ], 'Compte créé avec succès', 201);
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

        $token = self::createSession($user['id']);

        // Fetch profile info based on usertype
        $profile = [];
        $usertype = (int)$user['usertype'];

        if ($usertype === 0) {
            // Patient
            $stmt = $pdo->prepare("SELECT * FROM patients WHERE user_id = ? LIMIT 1");
            $stmt->execute([$user['id']]);
            $profile = $stmt->fetch() ?: [];
            unset($profile['photoprofile']);
        } elseif ($usertype === 1) {
            // Doctor — check status
            $stmt = $pdo->prepare("SELECT * FROM doctors WHERE user_id = ? LIMIT 1");
            $stmt->execute([$user['id']]);
            $profile = $stmt->fetch() ?: [];
            if (!empty($profile['status']) && $profile['status'] !== 'APPROVED') {
                Database::getInstance()->prepare("DELETE FROM sessions WHERE token = ?")->execute([$token]);
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
                unset($clinic['logo']);
                $profile = $clinic;
            }
        } elseif ($usertype === 3) {
            // Admin
            $profile = ['user_type_label' => 'admin', 'username' => $user['username']];
        }

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

        // Check if patient exists
        $stmt = $pdo->prepare("SELECT * FROM patients WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $patient = $stmt->fetch();

        if ($patient) {
            // User exists, log them in
            $userId = $patient['user_id'];
            $stmtUser = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
            $stmtUser->execute([$userId]);
            $user = $stmtUser->fetch();

            if (!$user) {
                Response::error("Erreur d'intégrité du compte", 500);
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

            // Insert Patient
            $pdo->prepare("
                INSERT INTO patients (id, Reference, fullname, phone, email, birthdate, gender, user_id, country, DeleteAcount)
                VALUES (?, '', ?, '', ?, NULL, 0, ?, 'Algérie', 0)
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
