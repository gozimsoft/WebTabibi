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
    public static function authenticate(): array {
        $headers  = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
            Response::unauthorized('Token manquant / Missing token');
        }

        $token = trim($matches[1]);
        $pdo   = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT s.user_id, s.created_at, u.UserType, u.Username
            FROM sessions s
            JOIN Users u ON u.ID = s.user_id
            WHERE s.token = ?
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $session = $stmt->fetch();

        if (!$session) {
            Response::unauthorized('Token invalide / Invalid token');
        }

        // Check expiry
        $created = strtotime($session['created_at']);
        if (time() - $created > TOKEN_EXPIRY) {
            // Delete expired session
            $pdo->prepare("DELETE FROM sessions WHERE token = ?")->execute([$token]);
            Response::unauthorized('Session expirée / Session expired');
        }

        return $session;
    }

    /**
     * Only patients (UserType = 0) allowed.
     */
    public static function patientOnly(): array {
        $session = self::authenticate();
        if ((int)$session['UserType'] !== 0) {
            Response::error('Accès réservé aux patients', 403);
        }
        return $session;
    }

    /**
     * Only doctors (UserType = 1) allowed.
     */
    public static function doctorOnly(): array {
        $session = self::authenticate();
        if ((int)$session['UserType'] !== 1) {
            Response::error('Accès réservé aux médecins', 403);
        }
        return $session;
    }

    /**
     * Only clinics (UserType = 2) allowed.
     */
    public static function clinicOnly(): array {
        $session = self::authenticate();
        if ((int)$session['UserType'] !== 2) {
            Response::error('Accès réservé aux cliniques', 403);
        }
        return $session;
    }

    /**
     * Only admins (UserType = 3) allowed.
     */
    public static function adminOnly(): array {
        $session = self::authenticate();
        if ((int)$session['UserType'] !== 3) {
            Response::error('Accès réservé aux administrateurs', 403);
        }
        return $session;
    }
}
