<?php
require_once __DIR__ . '/../backend/core/Database.php';

try {
    $pdo = Database::getInstance();
    
    echo "Creating admin_support_tickets table...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `admin_support_tickets` (
            `id` CHAR(36) NOT NULL,
            `ticket_number` VARCHAR(30) NOT NULL UNIQUE,
            `user_id` CHAR(36) NOT NULL,
            `user_type` TINYINT NOT NULL DEFAULT 0 COMMENT '0=Patient, 1=Doctor, 2=Clinic, 4=Support',
            `category` VARCHAR(50) NOT NULL DEFAULT 'other',
            `subject` VARCHAR(255) NOT NULL,
            `status` ENUM('OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
            `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            INDEX `idx_ast_user` (`user_id`),
            INDEX `idx_ast_status` (`status`),
            INDEX `idx_ast_category` (`category`),
            INDEX `idx_ast_created` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    echo "Creating admin_support_messages table...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `admin_support_messages` (
            `id` CHAR(36) NOT NULL,
            `ticket_id` CHAR(36) NOT NULL,
            `sender_id` CHAR(36) NOT NULL,
            `sender_type` ENUM('user', 'admin', 'support') NOT NULL DEFAULT 'user',
            `message` TEXT NOT NULL,
            `is_read` TINYINT(1) NOT NULL DEFAULT 0,
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            INDEX `idx_asm_ticket` (`ticket_id`),
            INDEX `idx_asm_sender` (`sender_id`),
            INDEX `idx_asm_read` (`is_read`),
            CONSTRAINT `fk_asm_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `admin_support_tickets` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    echo "✅ Tables created successfully!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
