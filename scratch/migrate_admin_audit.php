<?php
// ============================================================
// scratch/migrate_admin_audit.php
// Migration idempotente — Audit administrateur & horodatage session
// ============================================================
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$errors = [];
$successes = [];

function safe($pdo, $sql, &$successes, &$errors, $label) {
    try {
        $pdo->exec($sql);
        $successes[] = "OK: $label";
    } catch (PDOException $e) {
        // Ignore "duplicate column" errors (1060) — idempotent
        if ($e->getCode() == '42S21' || strpos($e->getMessage(), 'Duplicate column') !== false || strpos($e->getMessage(), '1060') !== false) {
            $successes[] = "SKIP (already exists): $label";
        } else {
            $errors[] = "ERROR [$label]: " . $e->getMessage();
        }
    }
}

// 1. Add ip_address to sessions
safe($pdo,
    "ALTER TABLE sessions ADD COLUMN ip_address VARCHAR(45) NULL DEFAULT NULL AFTER created_at",
    $successes, $errors, "sessions.ip_address"
);

// 2. Add user_agent to sessions
safe($pdo,
    "ALTER TABLE sessions ADD COLUMN user_agent VARCHAR(512) NULL DEFAULT NULL AFTER ip_address",
    $successes, $errors, "sessions.user_agent"
);

// 3. Add last_login_at to users
safe($pdo,
    "ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL DEFAULT NULL AFTER usertype",
    $successes, $errors, "users.last_login_at"
);

// 4. Add last_login_ip to users
safe($pdo,
    "ALTER TABLE users ADD COLUMN last_login_ip VARCHAR(45) NULL DEFAULT NULL AFTER last_login_at",
    $successes, $errors, "users.last_login_ip"
);

// 5. Backfill: set ip for existing admin sessions from localhost
safe($pdo,
    "UPDATE sessions SET ip_address = '127.0.0.1' WHERE ip_address IS NULL AND user_id IN (SELECT id FROM users WHERE usertype IN (3,4))",
    $successes, $errors, "backfill admin sessions ip"
);

// 6. Backfill last_login_at / last_login_ip for admin users from latest session
safe($pdo,
    "UPDATE users u
     JOIN (
         SELECT user_id, ip_address, created_at
         FROM sessions
         WHERE id IN (SELECT MAX(id) FROM sessions GROUP BY user_id)
     ) s ON s.user_id = u.id
     SET u.last_login_at = s.created_at, u.last_login_ip = COALESCE(s.ip_address, '127.0.0.1')
     WHERE u.usertype IN (3, 4) AND u.last_login_at IS NULL",
    $successes, $errors, "backfill users last_login from sessions"
);

echo "=== Migration Results ===\n";
foreach ($successes as $s) echo "[✔] $s\n";
foreach ($errors as $e) echo "[✘] $e\n";
echo "\n=== SESSIONS DESCRIBE ===\n";
foreach ($pdo->query("DESCRIBE sessions")->fetchAll(PDO::FETCH_ASSOC) as $c) {
    echo "  " . $c['Field'] . " (" . $c['Type'] . ") Null:" . $c['Null'] . "\n";
}
echo "\n=== USERS DESCRIBE ===\n";
foreach ($pdo->query("DESCRIBE users")->fetchAll(PDO::FETCH_ASSOC) as $c) {
    echo "  " . $c['Field'] . " (" . $c['Type'] . ") Null:" . $c['Null'] . "\n";
}
