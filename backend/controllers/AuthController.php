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
                INSERT INTO patients (id, Reference, fullname, phone, email, birthdate, gender, user_id, country, DeleteAcount)
                VALUES (?, '', ?, ?, ?, ?, ?, ?, 'Algérie', 0)
            ")->execute([
                $patientId,
                trim($data['fullname']),
                $data['phone'] ?? '',
                $data['email'],
                $data['birthdate'] ?? null,
                isset($data['gender']) ? (int)$data['gender'] : 0,
                $userId,
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
    // POST /api/auth/logout
    // ----------------------------------------------------------
    public static function logout(): void {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';
        $session = AuthMiddleware::authenticate();

        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
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
}
