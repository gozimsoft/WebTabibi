<?php
// ============================================================
// helpers/NotificationHelper.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/UUIDHelper.php';

class NotificationHelper {
    
    /**
     * إنشاء تنبيه جديد للمستخدم
     * 
     * @param string $userId معرف المستخدم المستلم (UUID)
     * @param string $title عنوان التنبيه باللغة العربية أو الفرنسية
     * @param string $message نص التنبيه بالتفصيل
     * @param string $type نوع التنبيه (مثال: appointment, chat, system)
     * @return bool نجاح العملية أو فشلها
     */
    public static function notify(string $userId, string $title, string $message, string $type = 'system'): bool {
        try {
            $pdo = Database::getInstance();
            $id = UUIDHelper::generate();
            
            $stmt = $pdo->prepare("
                INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
                VALUES (?, ?, ?, ?, ?, 0, NOW())
            ");
            
            return $stmt->execute([$id, $userId, $title, $message, $type]);
        } catch (Throwable $e) {
            // تسجيل الخطأ في السجل لتفادي تعطل العملية الرئيسية للمستخدم
            error_log("Failed to create notification: " . $e->getMessage());
            return false;
        }
    }
}
