<?php
// ============================================================
// test_otp_match.php — تشخيص دقيق خطوة بخطوة لمشكلة مطابقة OTP
// احذف هذا الملف بعد الانتهاء!
// ============================================================
require_once __DIR__ . '/core/Database.php';
header('Content-Type: application/json; charset=UTF-8');

$pdo = Database::getInstance();

// ── التوقيت ─────────────────────────────────────────────────
$mysqlNow       = $pdo->query("SELECT NOW()")->fetchColumn();
$mysqlUtc       = $pdo->query("SELECT UTC_TIMESTAMP()")->fetchColumn();
$phpNow         = date('Y-m-d H:i:s');

// ── كل السجلات الموجودة في الجدول ──────────────────────────
$allRows = $pdo->query("
    SELECT 
        id, type, target, code, verified,
        expires_at,
        NOW() as mysql_now,
        (expires_at > NOW()) as valid_now,
        (expires_at > UTC_TIMESTAMP()) as valid_utc,
        TIMESTAMPDIFF(SECOND, NOW(), expires_at) as secs_left_now,
        created_at,
        HEX(code) as code_hex,
        LENGTH(code) as code_len,
        CHAR_LENGTH(code) as code_charlen
    FROM verifications
    ORDER BY created_at DESC
    LIMIT 10
")->fetchAll(PDO::FETCH_ASSOC);

// ── اختبار البحث مباشرةً ─────────────────────────────────
$email  = $_GET['email'] ?? null;
$code   = $_GET['code']  ?? null;
$testResult = null;

if ($email && $code) {
    $email = trim($email);
    $code  = trim($code);

    // Test 1: بحث بدون أي شرط سوى الإيميل
    $s = $pdo->prepare("SELECT * FROM verifications WHERE target = ? ORDER BY created_at DESC LIMIT 1");
    $s->execute([$email]);
    $byEmail = $s->fetch(PDO::FETCH_ASSOC);

    // Test 2: مطابقة الرمز فقط بدون شرط الوقت أو الحالة
    $s2 = $pdo->prepare("SELECT *, HEX(code) as code_hex, (code = ?) as code_match FROM verifications WHERE target = ? ORDER BY created_at DESC LIMIT 1");
    $s2->execute([$code, $email]);
    $codeCheck = $s2->fetch(PDO::FETCH_ASSOC);

    // Test 3: نفس استعلام registerConfirm
    $s3 = $pdo->prepare("
        SELECT id FROM verifications
        WHERE target = ? AND type IN ('email_reg', 'email_regi') AND code = ?
          AND verified = 0 AND expires_at > NOW()
        ORDER BY created_at DESC LIMIT 1
    ");
    $s3->execute([$email, $code]);
    $fullQuery = $s3->fetch(PDO::FETCH_ASSOC);

    // Test 4: مطابقة صارمة مع إظهار السبب الدقيق
    if ($byEmail) {
        $dbCode    = $byEmail['code'];
        $dbType    = $byEmail['type'];
        $dbVerif   = $byEmail['verified'];
        $dbExpires = $byEmail['expires_at'];

        $diagnose = [
            'db_code'         => $dbCode,
            'input_code'      => $code,
            'code_match'      => ($dbCode === $code),
            'code_php_eq'     => ($dbCode == $code),
            'db_code_hex'     => bin2hex($dbCode),
            'input_code_hex'  => bin2hex($code),
            'db_type'         => $dbType,
            'type_ok'         => in_array($dbType, ['email_reg', 'email_regi']),
            'verified'        => $dbVerif,
            'verified_ok'     => ($dbVerif == 0),
            'expires_at'      => $dbExpires,
            'mysql_now'       => $mysqlNow,
            'not_expired'     => ($dbExpires > $mysqlNow),
            'reason_failing'  => [],
        ];

        if (!$diagnose['code_match'])    $diagnose['reason_failing'][] = 'Rمز لا يتطابق بالمقارنة الصارمة (===)';
        if (!$diagnose['type_ok'])       $diagnose['reason_failing'][] = "type '{$dbType}' غير معروف";
        if (!$diagnose['verified_ok'])   $diagnose['reason_failing'][] = 'verified = 1 (تم التحقق مسبقاً)';
        if (!$diagnose['not_expired'])   $diagnose['reason_failing'][] = 'expires_at منتهي الصلاحية';
        if (empty($diagnose['reason_failing'])) $diagnose['reason_failing'][] = 'لا توجد مشكلة واضحة — يجب أن يعمل!';

        $testResult = [
            'by_email_only'   => $byEmail,
            'code_check'      => $codeCheck,
            'full_query_result' => $fullQuery ? 'FOUND ✅' : 'NOT FOUND ❌',
            'diagnosis'       => $diagnose,
        ];
    } else {
        $testResult = ['error' => "لا يوجد سجل بهذا الإيميل: {$email}"];
    }
}

echo json_encode([
    'mysql_NOW'        => $mysqlNow,
    'mysql_UTC'        => $mysqlUtc,
    'php_date'         => $phpNow,
    'all_verifications'=> $allRows,
    'usage'            => 'أضف ?email=البريد&code=الرمز لاختبار المطابقة',
    'test'             => $testResult,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
