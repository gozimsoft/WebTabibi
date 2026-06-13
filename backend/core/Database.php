<?php
// ============================================================
// core/Database.php
// ============================================================
require_once __DIR__ . '/../config/database.php';

class Database {
    private static ?PDO $instance = null;

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
            );
            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                ]);
                self::ensureNotificationsTableExists(self::$instance);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Database connection failed']);
                exit;
            }
        }
        return self::$instance;
    }

    private static function ensureNotificationsTableExists(PDO $pdo): void {
        try {
            // تحقق من وجود الجدول لتجنب تكرار الإنشاء أو الخطأ
            // Check if notifications table exists, if not, create it
            $stmt = $pdo->query("SHOW TABLES LIKE 'notifications'");
            if ($stmt->rowCount() === 0) {
                $sql = "CREATE TABLE IF NOT EXISTS `notifications` (
                    `id` VARCHAR(36) NOT NULL,
                    `user_id` VARCHAR(36) NOT NULL,
                    `title` VARCHAR(255) NOT NULL,
                    `message` TEXT NOT NULL,
                    `type` VARCHAR(50) NOT NULL DEFAULT 'system',
                    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
                    `created_at` DATETIME NOT NULL,
                    PRIMARY KEY (`id`),
                    INDEX `idx_notifications_user_id` (`user_id`),
                    INDEX `idx_notifications_is_read` (`is_read`),
                    INDEX `idx_notifications_created_at` (`created_at`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
                $pdo->exec($sql);
            }
        } catch (Exception $e) {
            error_log("Failed to auto-migrate notifications table: " . $e->getMessage());
        }
    }
}
