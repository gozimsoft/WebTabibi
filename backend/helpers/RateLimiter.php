<?php
// ============================================================
// helpers/RateLimiter.php  —  Tabibi API Security Rate Limiter
// ============================================================
declare(strict_types=1);

require_once __DIR__ . '/../core/Database.php';

class RateLimiter {
    private static bool $tableChecked = false;

    /**
     * Initialise la table rate_limits si elle n'existe pas
     */
    private static function initTable(PDO $pdo): void {
        if (self::$tableChecked) {
            return;
        }
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS rate_limits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                rate_key VARCHAR(191) NOT NULL,
                action VARCHAR(64) NOT NULL,
                attempts INT NOT NULL DEFAULT 1,
                first_attempt_at DATETIME NOT NULL,
                last_attempt_at DATETIME NOT NULL,
                blocked_until DATETIME NULL,
                INDEX idx_key_action (rate_key, action),
                INDEX idx_blocked (blocked_until)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
        self::$tableChecked = true;
    }

    /**
     * Vérifie si la clé est actuellement bloquée
     * 
     * @return array{blocked: bool, retry_after: int}|null Null si non bloqué
     */
    public static function check(string $key, string $action): ?array {
        $pdo = Database::getInstance();
        self::initTable($pdo);

        $stmt = $pdo->prepare("
            SELECT blocked_until, TIMESTAMPDIFF(SECOND, NOW(), blocked_until) AS retry_after
            FROM rate_limits
            WHERE rate_key = ? AND action = ? AND blocked_until > NOW()
            LIMIT 1
        ");
        $stmt->execute([$key, $action]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && (int)$row['retry_after'] > 0) {
            return [
                'blocked' => true,
                'retry_after' => (int)$row['retry_after'],
            ];
        }

        return null;
    }

    /**
     * Enregistre une tentative / un échec
     * 
     * @param string $key Identifiant (IP ou clé compte)
     * @param string $action Nom de l'action ('login_ip', 'login_account', etc.)
     * @param int $maxAttempts Nombre max de tentatives autorisées
     * @param int $windowSeconds Fenêtre temporelle en secondes
     * @param int $blockDurationSeconds Durée de blocage en secondes si le seuil est atteint
     * @return array{blocked: bool, attempts: int, remaining: int, retry_after: int}
     */
    public static function hit(
        string $key,
        string $action,
        int $maxAttempts,
        int $windowSeconds,
        int $blockDurationSeconds
    ): array {
        $pdo = Database::getInstance();
        self::initTable($pdo);

        // Nettoyage des vieux enregistrements (> 24 heures)
        // 1 chance sur 50 pour minimiser l'overhead
        if (random_int(1, 50) === 1) {
            $pdo->exec("DELETE FROM rate_limits WHERE last_attempt_at < DATE_SUB(NOW(), INTERVAL 1 DAY) AND (blocked_until IS NULL OR blocked_until < NOW())");
        }

        $stmt = $pdo->prepare("
            SELECT id, attempts, first_attempt_at, last_attempt_at, blocked_until,
                   TIMESTAMPDIFF(SECOND, first_attempt_at, NOW()) AS elapsed
            FROM rate_limits
            WHERE rate_key = ? AND action = ?
            LIMIT 1
        ");
        $stmt->execute([$key, $action]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            $ins = $pdo->prepare("
                INSERT INTO rate_limits (rate_key, action, attempts, first_attempt_at, last_attempt_at, blocked_until)
                VALUES (?, ?, 1, NOW(), NOW(), NULL)
            ");
            $ins->execute([$key, $action]);

            return [
                'blocked' => false,
                'attempts' => 1,
                'remaining' => max(0, $maxAttempts - 1),
                'retry_after' => 0,
            ];
        }

        $elapsed = (int)($record['elapsed'] ?? 0);
        $attempts = (int)$record['attempts'];

        // Si la fenêtre est expirée et qu'on n'est plus bloqué, on réinitialise le compteur
        if ($elapsed > $windowSeconds && (empty($record['blocked_until']) || strtotime($record['blocked_until']) <= time())) {
            $upd = $pdo->prepare("
                UPDATE rate_limits
                SET attempts = 1, first_attempt_at = NOW(), last_attempt_at = NOW(), blocked_until = NULL
                WHERE id = ?
            ");
            $upd->execute([$record['id']]);

            return [
                'blocked' => false,
                'attempts' => 1,
                'remaining' => max(0, $maxAttempts - 1),
                'retry_after' => 0,
            ];
        }

        // Incrémentation des tentatives
        $newAttempts = $attempts + 1;
        $blockedUntil = null;
        $isBlocked = false;
        $retryAfter = 0;

        if ($newAttempts >= $maxAttempts) {
            $isBlocked = true;
            $retryAfter = $blockDurationSeconds;
            $upd = $pdo->prepare("
                UPDATE rate_limits
                SET attempts = ?, last_attempt_at = NOW(), blocked_until = DATE_ADD(NOW(), INTERVAL ? SECOND)
                WHERE id = ?
            ");
            $upd->execute([$newAttempts, $blockDurationSeconds, $record['id']]);
        } else {
            $upd = $pdo->prepare("
                UPDATE rate_limits
                SET attempts = ?, last_attempt_at = NOW()
                WHERE id = ?
            ");
            $upd->execute([$newAttempts, $record['id']]);
        }

        return [
            'blocked' => $isBlocked,
            'attempts' => $newAttempts,
            'remaining' => max(0, $maxAttempts - $newAttempts),
            'retry_after' => $retryAfter,
        ];
    }

    /**
     * Réinitialise les tentatives après un succès (login réussi, code OTP valide, etc.)
     */
    public static function reset(string $key, string $action): void {
        $pdo = Database::getInstance();
        self::initTable($pdo);

        $stmt = $pdo->prepare("DELETE FROM rate_limits WHERE rate_key = ? AND action = ?");
        $stmt->execute([$key, $action]);
    }

    /**
     * Récupère l'adresse IP du client de façon sécurisée
     */
    public static function getClientIp(): string {
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            $ip = trim($_SERVER['HTTP_CF_CONNECTING_IP']);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $first = trim($parts[0]);
            if (filter_var($first, FILTER_VALIDATE_IP)) {
                return $first;
            }
        }
        $remote = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if ($remote === '::1') {
            return '127.0.0.1';
        }
        return filter_var($remote, FILTER_VALIDATE_IP) ? $remote : '127.0.0.1';
    }
}
