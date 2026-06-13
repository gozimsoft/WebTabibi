<?php
require_once __DIR__ . '/core/Database.php';

$pdo = Database::getInstance();

try {
    // 1. Create verifications table
    $sql = "
    CREATE TABLE IF NOT EXISTS `verifications` (
      `id`         char(36)     NOT NULL,
      `user_id`    char(36)     DEFAULT NULL,
      `type`       varchar(10)  NOT NULL comment 'email or phone',
      `target`     varchar(100) NOT NULL comment 'the email or phone being verified',
      `code`       varchar(10)  NOT NULL,
      `expires_at` datetime     NOT NULL,
      `verified`   tinyint(1)   DEFAULT 0,
      `created_at` datetime     DEFAULT current_timestamp(),
      PRIMARY KEY (`id`),
      KEY `user_type_idx` (`user_id`, `type`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($sql);
    echo "Table 'verifications' created or already exists.\n";

    // 2. Add emailvalidation and phonevalidation to patients if not exist
    $tables = ['patients', 'doctors', 'clinics'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW COLUMNS FROM `$table` LIKE 'emailvalidation'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE `$table` ADD COLUMN `emailvalidation` TINYINT(1) DEFAULT 1");
            echo "Added 'emailvalidation' column to '$table' table.\n";
        }

        $stmt = $pdo->query("SHOW COLUMNS FROM `$table` LIKE 'phonevalidation'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE `$table` ADD COLUMN `phonevalidation` TINYINT(1) DEFAULT 0");
            echo "Added 'phonevalidation' column to '$table' table.\n";
        }
    }

    echo "Database setup completed successfully.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
