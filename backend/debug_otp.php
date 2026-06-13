<?php
// ============================================================
// debug_otp.php — تشخيص مشكلة رمز OTP
// استخدم: http://localhost:8000/debug_otp.php
// احذف هذا الملف بعد التشخيص!
// ============================================================
require_once __DIR__ . '/core/Database.php';

header('Content-Type: application/json; charset=UTF-8');

$pdo = Database::getInstance();

// 1. مقارنة توقيت PHP مع MySQL
$phpTime      = date('Y-m-d H:i:s');
$phpUtcTime   = gmdate('Y-m-d H:i:s');
$mysqlNow     = $pdo->query("SELECT NOW() as t")->fetchColumn();
$mysqlUtcNow  = $pdo->query("SELECT UTC_TIMESTAMP() as t")->fetchColumn();
$mysqlTZ      = $pdo->query("SELECT @@global.time_zone as tz")->fetchColumn();
$mysqlSessTZ  = $pdo->query("SELECT @@session.time_zone as tz")->fetchColumn();

// 2. عرض آخر 5 سجلات في جدول verifications
$stmt = $pdo->query("SELECT id, type, target, code, expires_at, verified, created_at FROM verifications ORDER BY created_at DESC LIMIT 5");
$verifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 3. اختبار مباشر: هل الرمز المدخل سيطابق؟
$testEmail = $_GET['email'] ?? null;
$testCode  = $_GET['code']  ?? null;
$testResult = null;
if ($testEmail && $testCode) {
    $s = $pdo->prepare("
        SELECT *,
               (expires_at > UTC_TIMESTAMP()) as not_expired_utc,
               (expires_at > NOW()) as not_expired_now,
               TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(), expires_at) as seconds_left_utc,
               TIMESTAMPDIFF(SECOND, NOW(), expires_at) as seconds_left_now
        FROM verifications
        WHERE target = ? AND type = 'email_reg' AND code = ?
        ORDER BY created_at DESC LIMIT 1
    ");
    $s->execute([$testEmail, $testCode]);
    $withCode = $s->fetch(PDO::FETCH_ASSOC);

    // بحث بدون شرط الوقت والتحقق
    $s2 = $pdo->prepare("SELECT * FROM verifications WHERE target = ? AND type = 'email_reg' ORDER BY created_at DESC LIMIT 1");
    $s2->execute([$testEmail]);
    $anyRecord = $s2->fetch(PDO::FETCH_ASSOC);

    $testResult = [
        'found_with_code_match' => $withCode ? true : false,
        'record_with_code'      => $withCode,
        'latest_record_no_filter' => $anyRecord,
    ];
}

echo json_encode([
    'php_time'                    => $phpTime,
    'php_utc_time'                => $phpUtcTime,
    'mysql_NOW'                   => $mysqlNow,
    'mysql_UTC_TIMESTAMP'         => $mysqlUtcNow,
    'mysql_global_tz'             => $mysqlTZ,
    'mysql_session_tz'            => $mysqlSessTZ,
    'diff_php_vs_mysql_seconds'   => strtotime($phpTime) - strtotime($mysqlNow),
    'diff_phpUTC_vs_mysqlUTC_sec' => strtotime($phpUtcTime) - strtotime($mysqlUtcNow),
    'last_5_verifications'        => $verifications,
    'test'                        => $testResult,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
