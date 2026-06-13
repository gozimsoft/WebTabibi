<?php
// سكريبت مؤقت للتحقق من جدول الإشعارات في قاعدة البيانات
require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');

try {
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 10,
    ]);

    // فحص وجود الجدول
    $stmt = $pdo->query("SHOW TABLES LIKE 'notifications'");
    $tableExists = $stmt->rowCount() > 0;

    $result = [
        'db_connected' => true,
        'notifications_table_exists' => $tableExists,
    ];

    if ($tableExists) {
        $count = $pdo->query('SELECT COUNT(*) as cnt FROM notifications')->fetch(PDO::FETCH_ASSOC);
        $sample = $pdo->query('SELECT * FROM notifications LIMIT 3')->fetchAll(PDO::FETCH_ASSOC);
        $result['row_count'] = $count['cnt'];
        $result['sample_rows'] = $sample;
    } else {
        // إنشاء الجدول
        $sql = "CREATE TABLE IF NOT EXISTS `notifications` (
            `id` VARCHAR(36) NOT NULL,
            `user_id` VARCHAR(36) NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `message` TEXT NOT NULL,
            `type` VARCHAR(50) NOT NULL DEFAULT 'system',
            `is_read` TINYINT(1) NOT NULL DEFAULT 0,
            `created_at` DATETIME NOT NULL,
            PRIMARY KEY (`id`),
            INDEX `idx_notifications_user_id` (`user_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        $pdo->exec($sql);
        $result['table_created'] = true;
    }

    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'db_connected' => false,
        'error' => $e->getMessage(),
        'code' => $e->getCode(),
    ], JSON_PRETTY_PRINT);
}
