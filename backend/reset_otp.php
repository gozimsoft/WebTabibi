<?php
// ============================================================
// reset_otp.php — إعادة ضبط رمز التحقق المحروق
// يُستخدم مرة واحدة فقط ثم يُحذف!
// ============================================================
require_once __DIR__ . '/core/Database.php';
header('Content-Type: application/json; charset=UTF-8');

$pdo = Database::getInstance();

// إعادة كل رموز email_reg المحروقة (verified=1) التي لم يُنشأ لها حساب
// نتحقق: إذا verified=1 لكن لا يوجد patient بهذا الإيميل → إعادة verified=0
$stmt = $pdo->query("
    SELECT v.id, v.target, v.code, v.expires_at, v.verified
    FROM verifications v
    WHERE v.type IN ('email_reg', 'email_regi')
      AND v.verified = 1
      AND v.target NOT IN (SELECT email FROM patients WHERE email IS NOT NULL)
      AND v.expires_at > NOW()
");
$orphaned = $stmt->fetchAll(PDO::FETCH_ASSOC);

$reset = 0;
foreach ($orphaned as $row) {
    $pdo->prepare("UPDATE verifications SET verified = 0 WHERE id = ?")->execute([$row['id']]);
    $reset++;
}

// أيضاً حذف السجلات المنتهية الصلاحية
$deleted = $pdo->exec("DELETE FROM verifications WHERE expires_at < NOW()");

echo json_encode([
    'orphaned_found' => count($orphaned),
    'records_reset'  => $reset,
    'expired_deleted'=> $deleted,
    'details'        => $orphaned,
    'message'        => $reset > 0
        ? "✅ تم إعادة {$reset} رمز تحقق — يمكنك الآن المحاولة مجدداً"
        : "لا توجد رموز محروقة بدون حساب مقابل"
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
