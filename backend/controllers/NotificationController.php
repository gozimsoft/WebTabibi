<?php
// ============================================================
// controllers/NotificationController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class NotificationController {

    /**
     * جلب جميع التنبيهات الخاصة بالمستخدم الحالي مرتبة من الأحدث إلى الأقدم
     * GET /api/notifications
     */
    public static function list(): void {
        // التحقق من هوية المستخدم
        $session = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$session['user_id']]);
        $notifications = $stmt->fetchAll();

        Response::success($notifications);
    }

    /**
     * تحديث حالة تنبيه محدد ليكون مقروءاً
     * PUT /api/notifications/:id/read
     */
    public static function markAsRead(string $id): void {
        // التحقق من هوية المستخدم
        $session = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();

        // التأكد من أن التنبيه يخص المستخدم الحالي
        $stmt = $pdo->prepare("SELECT id FROM notifications WHERE id = ? AND user_id = ? LIMIT 1");
        $stmt->execute([$id, $session['user_id']]);
        if (!$stmt->fetch()) {
            Response::notFound('التنبيه غير موجود أو لا تملك صلاحية الوصول إليه');
        }

        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(null, 'تم تحديد التنبيه كمقروء');
    }

    /**
     * تحديد جميع التنبيهات كمقروءة للمستخدم الحالي
     * PUT /api/notifications/read-all
     */
    public static function markAllAsRead(): void {
        // التحقق من هوية المستخدم
        $session = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
        $stmt->execute([$session['user_id']]);

        Response::success(null, 'تم تحديد جميع التنبيهات كمقروءة');
    }

    /**
     * حذف تنبيه معين
     * DELETE /api/notifications/:id
     */
    public static function delete(string $id): void {
        // التحقق من هوية المستخدم
        $session = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();

        // التأكد من أن التنبيه يخص المستخدم الحالي
        $stmt = $pdo->prepare("SELECT id FROM notifications WHERE id = ? AND user_id = ? LIMIT 1");
        $stmt->execute([$id, $session['user_id']]);
        if (!$stmt->fetch()) {
            Response::notFound('التنبيه غير موجود أو لا تملك صلاحية الوصول إليه');
        }

        $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(null, 'تم حذف التنبيه بنجاح');
    }
}
