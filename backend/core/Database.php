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
                self::ensureUnavailabilitiesTableExists(self::$instance);
            } catch (PDOException $e) {
                // Log the technical error for developers only — never expose it to users
                error_log('[Tabibi DB Error] ' . $e->getMessage());
                http_response_code(503);
                echo json_encode([
                    'success' => false,
                    'message' => 'service_unavailable'
                ]);
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

    private static function ensureUnavailabilitiesTableExists(PDO $pdo): void {
        try {
            $stmt = $pdo->query("SHOW TABLES LIKE 'doctor_unavailabilities'");
            if ($stmt->rowCount() === 0) {
                $sql = "CREATE TABLE IF NOT EXISTS `doctor_unavailabilities` (
                    `id` CHAR(36) NOT NULL,
                    `doctor_id` CHAR(36) NOT NULL,
                    `clinic_id` CHAR(36) DEFAULT NULL,
                    `clinicsdoctor_id` CHAR(36) DEFAULT NULL,
                    `leave_type` ENUM('full_day', 'partial_hours', 'shift') NOT NULL DEFAULT 'full_day',
                    `start_datetime` DATETIME NOT NULL,
                    `end_datetime` DATETIME NOT NULL,
                    `shift_type` VARCHAR(20) DEFAULT NULL,
                    `reason` VARCHAR(255) DEFAULT NULL,
                    `show_reason_to_patient` TINYINT(1) NOT NULL DEFAULT 0,
                    `created_by_user_id` CHAR(36) DEFAULT NULL,
                    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    KEY `idx_doc_dates` (`doctor_id`, `start_datetime`, `end_datetime`),
                    KEY `idx_cd_dates` (`clinicsdoctor_id`, `start_datetime`, `end_datetime`),
                    CONSTRAINT `fk_unavail_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
                $pdo->exec($sql);
            }
        } catch (Exception $e) {
            error_log("Failed to auto-migrate doctor_unavailabilities table: " . $e->getMessage());
        }
    }
}
