<?php
// ============================================================
// fix_verifications.php — إصلاح جدول verifications
// تشغيل مرة واحدة: http://localhost:8000/fix_verifications.php
// احذف هذا الملف فوراً بعد التشغيل!
// ============================================================
require_once __DIR__ . '/core/Database.php';

header('Content-Type: application/json; charset=UTF-8');

$pdo = Database::getInstance();
$results = [];

try {
    // 1. توسيع عمود type من varchar(10) إلى varchar(20) لتفادي قطع القيم مستقبلاً
    $pdo->exec("ALTER TABLE verifications MODIFY COLUMN `type` varchar(20) NOT NULL");
    $results[] = "✅ تم توسيع عمود 'type' إلى varchar(20)";

    // 2. تنظيف السجلات القديمة المنتهية الصلاحية أو المتحقق منها
    $deleted = $pdo->exec("DELETE FROM verifications WHERE verified = 1 OR expires_at < NOW()");
    $results[] = "✅ تم حذف {$deleted} سجل منتهي الصلاحية أو متحقق منه";

    // 3. تصحيح السجلات القديمة من 'email_regi' إلى 'email_reg' (السجلات الصالحة فقط)
    $updated = $pdo->exec("UPDATE verifications SET type = 'email_reg' WHERE type = 'email_regi' AND verified = 0 AND expires_at > NOW()");
    $results[] = "✅ تم تحديث {$updated} سجل من 'email_regi' إلى 'email_reg'";

    // 4. عرض الحالة الحالية
    $stmt = $pdo->query("SELECT id, type, target, code, expires_at, verified FROM verifications ORDER BY created_at DESC LIMIT 10");
    $remaining = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status'    => 'success',
        'actions'   => $results,
        'remaining' => $remaining,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
