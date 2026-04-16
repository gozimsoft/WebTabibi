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
            Response::error('Email invalide.', 422);
        }

        $pdo = Database::getInstance();

        // Check username / email uniqueness
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Users WHERE Username = ?");
        $stmt->execute([strtolower(trim($data['username']))]);
        if ($stmt->fetchColumn() > 0) {
            Response::error("Ce nom d'utilisateur est déjà utilisé.", 409);
        }

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Patients WHERE Email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetchColumn() > 0) {
            Response::error("Cet email est déjà utilisé.", 409);
        }

        // Password: store as base64 for DB compatibility (varchar 50)
        $passwordEncoded = base64_encode($data['password']);

        $userId    = UUIDHelper::generate();
        $patientId = UUIDHelper::generate();

        $pdo->beginTransaction();
        try {
            // Insert User
            $pdo->prepare("INSERT INTO Users (ID, Username, Password, UserType) VALUES (?,?,?,0)")
                ->execute([$userId, strtolower(trim($data['username'])), $passwordEncoded]);

            // Insert Patient
            $pdo->prepare("
                INSERT INTO Patients (ID, Reference, FullName, Phone, Email, BirthDate, Gender, User_id, Country, DeleteAcount)
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
        $stmt = $pdo->prepare("SELECT * FROM Users WHERE Username = ? LIMIT 1");
        $stmt->execute([strtolower(trim($data['username']))]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error("Nom d'utilisateur ou mot de passe incorrect.", 401);
        }

        // Verify password (base64 encoded)
        $encoded = base64_encode($data['password']);
        if ($user['Password'] !== $encoded) {
            Response::error("Nom d'utilisateur ou mot de passe incorrect.", 401);
        }

        $token = self::createSession($user['ID']);

        // Fetch profile info
        $profile = [];
        if ((int)$user['UserType'] === 0) {
            $stmt = $pdo->prepare("SELECT * FROM Patients WHERE User_id = ? LIMIT 1");
            $stmt->execute([$user['ID']]);
            $profile = $stmt->fetch() ?: [];
        } else {
            $stmt = $pdo->prepare("SELECT * FROM Doctors WHERE User_id = ? LIMIT 1");
            $stmt->execute([$user['ID']]);
            $profile = $stmt->fetch() ?: [];
            unset($profile['PhotoProfile']); // Don't send blob over JSON
        }

        Response::success([
            'token'     => $token,
            'user_type' => (int)$user['UserType'],
            'user_id'   => $user['ID'],
            'username'  => $user['Username'],
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

        if ((int)$session['UserType'] === 0) {
            $stmt = $pdo->prepare("SELECT * FROM Patients WHERE User_id = ? LIMIT 1");
            $stmt->execute([$userId]);
            $profile = $stmt->fetch();
            unset($profile['PhotoProfile']);
            Response::success(['user_type' => 0, 'profile' => $profile]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM Doctors WHERE User_id = ? LIMIT 1");
            $stmt->execute([$userId]);
            $profile = $stmt->fetch();
            unset($profile['PhotoProfile']);
            Response::success(['user_type' => 1, 'profile' => $profile]);
        }
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
