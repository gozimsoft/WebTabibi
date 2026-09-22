<?php
// scratch/audit_non_regression_test.php
// Comprehensive non-destructive audit verification test for TABIBI profiles enhancements

require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/helpers/PasswordHelper.php';
require_once __DIR__ . '/../backend/helpers/RateLimiter.php';

$pdo = Database::getInstance();
$results = [];

function record($category, $test, $status, $detail) {
    global $results;
    $results[] = [
        'category' => $category,
        'test'     => $test,
        'status'   => $status, // PASS, WARNING, FAIL, BLOCKER
        'detail'   => $detail
    ];
    echo "[$status] $category :: $test -> $detail\n";
}

echo "===============================================================\n";
echo " TABIBI NON-REGRESSION SECURITY & STABILITY AUTOMATED AUDIT \n";
echo "===============================================================\n\n";

// --- 1. PHP Syntax & Lint Check ---
$controllers = [
    'PatientController.php',
    'DoctorController.php',
    'ClinicController.php',
    'AdminController.php',
    'AuthController.php',
    'RelationController.php',
    'TicketController.php',
];
foreach ($controllers as $ctrl) {
    $path = __DIR__ . '/../backend/controllers/' . $ctrl;
    exec("php -l \"$path\" 2>&1", $out, $code);
    if ($code === 0) {
        record('SYNTAX', "php -l $ctrl", 'PASS', 'No syntax errors detected');
    } else {
        record('SYNTAX', "php -l $ctrl", 'BLOCKER', implode(' ', $out));
    }
    unset($out);
}
exec("php -l \"" . __DIR__ . '/../backend/index.php' . "\" 2>&1", $out, $code);
record('SYNTAX', 'php -l index.php', $code === 0 ? 'PASS' : 'BLOCKER', $code === 0 ? 'No syntax errors' : implode(' ', $out));
unset($out);

// --- 2. PasswordHelper Verification ---
$plain = "TestPassword@2026!";
$hash = PasswordHelper::hash($plain);
$isBcrypt = strpos($hash, '$2y$') === 0;
record('PASSWORD', 'Bcrypt Prefix', $isBcrypt ? 'PASS' : 'BLOCKER', "Algorithm prefix: " . substr($hash, 0, 4));

$validVerify = PasswordHelper::verify($plain, $hash);
$invalidVerify = PasswordHelper::verify("WrongPass123", $hash);
record('PASSWORD', 'Hash Verification', ($validVerify && !$invalidVerify) ? 'PASS' : 'BLOCKER', 'Correct pwd verified, wrong pwd rejected');

$legacyBase64 = base64_encode($plain);
$isLegacyDetected = PasswordHelper::isLegacy($legacyBase64);
$isNotLegacyDetected = !PasswordHelper::isLegacy($hash);
record('PASSWORD', 'Legacy Base64 Detection', ($isLegacyDetected && $isNotLegacyDetected) ? 'PASS' : 'BLOCKER', 'Legacy Base64 properly detected for on-the-fly migration');

// --- 3. Sessions & Tokens ---
// Fetch users of each type
$uPatient = $pdo->query("SELECT u.id, u.username FROM users u WHERE u.usertype = 0 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$uDoctor  = $pdo->query("SELECT u.id, u.username FROM users u WHERE u.usertype = 1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$uClinic  = $pdo->query("SELECT u.id, u.username FROM users u WHERE u.usertype = 2 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$uAdmin   = $pdo->query("SELECT u.id, u.username FROM users u WHERE u.usertype = 3 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$uSupport = $pdo->query("SELECT u.id, u.username FROM users u WHERE u.usertype = 4 LIMIT 1")->fetch(PDO::FETCH_ASSOC);

function createTempToken($pdo, $userId) {
    if (!$userId) return null;
    $token = 'audit_token_' . bin2hex(random_bytes(16));
    $pdo->prepare("INSERT INTO sessions (user_id, token, created_at, ip_address, user_agent) VALUES (?, ?, NOW(), '127.0.0.1', 'AuditAgent/1.0')")
        ->execute([$userId, $token]);
    return $token;
}

$tokenPatient = createTempToken($pdo, $uPatient['id'] ?? null);
$tokenDoctor  = createTempToken($pdo, $uDoctor['id'] ?? null);
$tokenClinic  = createTempToken($pdo, $uClinic['id'] ?? null);
$tokenAdmin   = createTempToken($pdo, $uAdmin['id'] ?? null);
$tokenSupport = createTempToken($pdo, $uSupport['id'] ?? null);

function curlReq($url, $method = 'GET', $token = null, $body = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    $hdrs = ['Accept: application/json'];
    if ($token) $hdrs[] = "Authorization: Bearer $token";
    if ($body) {
        $hdrs[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $hdrs);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'data' => json_decode($res, true), 'raw' => $res];
}

$baseUrl = "http://localhost/tabibi/backend";

// --- 4. RBAC on /admin/system-status ---
$rSysNoAuth  = curlReq("$baseUrl/admin/system-status", 'GET', null);
$rSysPatient = curlReq("$baseUrl/admin/system-status", 'GET', $tokenPatient);
$rSysDoctor  = curlReq("$baseUrl/admin/system-status", 'GET', $tokenDoctor);
$rSysClinic  = curlReq("$baseUrl/admin/system-status", 'GET', $tokenClinic);
$rSysAdmin   = curlReq("$baseUrl/admin/system-status", 'GET', $tokenAdmin);
$rSysSupport = curlReq("$baseUrl/admin/system-status", 'GET', $tokenSupport);

record('RBAC', 'admin/system-status no-auth', $rSysNoAuth['code'] === 401 ? 'PASS' : 'FAIL', "HTTP {$rSysNoAuth['code']} (expected 401)");
record('RBAC', 'admin/system-status patient', $rSysPatient['code'] === 403 ? 'PASS' : 'FAIL', "HTTP {$rSysPatient['code']} (expected 403)");
record('RBAC', 'admin/system-status doctor',  $rSysDoctor['code'] === 403 ? 'PASS' : 'FAIL', "HTTP {$rSysDoctor['code']} (expected 403)");
record('RBAC', 'admin/system-status clinic',  $rSysClinic['code'] === 403 ? 'PASS' : 'FAIL', "HTTP {$rSysClinic['code']} (expected 403)");
record('RBAC', 'admin/system-status admin',   $rSysAdmin['code'] === 200 ? 'PASS' : 'FAIL', "HTTP {$rSysAdmin['code']} (expected 200)");
record('RBAC', 'admin/system-status support', $rSysSupport['code'] === 200 ? 'PASS' : 'FAIL', "HTTP {$rSysSupport['code']} (expected 200)");

// --- 5. RBAC on /patients/photo ---
$rPhotoDoctor = curlReq("$baseUrl/patients/photo", 'POST', $tokenDoctor);
$rPhotoClinic = curlReq("$baseUrl/patients/photo", 'POST', $tokenClinic);
$rPhotoAdmin  = curlReq("$baseUrl/patients/photo", 'POST', $tokenAdmin);

record('RBAC', 'patients/photo doctor access', $rPhotoDoctor['code'] === 403 ? 'PASS' : 'FAIL', "HTTP {$rPhotoDoctor['code']} (expected 403)");
record('RBAC', 'patients/photo clinic access', $rPhotoClinic['code'] === 403 ? 'PASS' : 'FAIL', "HTTP {$rPhotoClinic['code']} (expected 403)");
record('RBAC', 'patients/photo admin access',  $rPhotoAdmin['code'] === 403 ? 'PASS' : 'FAIL', "HTTP {$rPhotoAdmin['code']} (expected 403)");

// --- 6. RBAC on /doctors/profile ---
$rDocPatient = curlReq("$baseUrl/doctors/profile", 'GET', $tokenPatient);
$rDocClinic  = curlReq("$baseUrl/doctors/profile", 'GET', $tokenClinic);
$rDocSelf    = curlReq("$baseUrl/doctors/profile", 'GET', $tokenDoctor);

record('RBAC', 'doctors/profile patient access', $rDocPatient['code'] === 403 ? 'PASS' : 'FAIL', "HTTP {$rDocPatient['code']} (expected 403)");
record('RBAC', 'doctors/profile clinic access',  $rDocClinic['code'] === 403 ? 'PASS' : 'FAIL', "HTTP {$rDocClinic['code']} (expected 403)");
record('RBAC', 'doctors/profile doctor self',    $rDocSelf['code'] === 200 ? 'PASS' : 'FAIL', "HTTP {$rDocSelf['code']} (expected 200)");

// --- 7. RBAC on /clinics/profile ---
$rCliPatient = curlReq("$baseUrl/clinics/profile", 'GET', $tokenPatient);
$rCliDoctor  = curlReq("$baseUrl/clinics/profile", 'GET', $tokenDoctor);
$rCliSelf    = curlReq("$baseUrl/clinics/profile", 'GET', $tokenClinic);

record('RBAC', 'clinics/profile patient access', $rCliPatient['code'] === 403 ? 'PASS' : 'FAIL', "HTTP {$rCliPatient['code']} (expected 403)");
record('RBAC', 'clinics/profile doctor access',  $rCliDoctor['code'] === 403 ? 'PASS' : 'FAIL', "HTTP {$rCliDoctor['code']} (expected 403)");
record('RBAC', 'clinics/profile clinic self',    $rCliSelf['code'] === 200 ? 'PASS' : 'FAIL', "HTTP {$rCliSelf['code']} (expected 200)");

// --- 8. SQL Injection & Prepared Statement Check on /baladiyas ---
$rSqlInject = curlReq("$baseUrl/baladiyas?wilaya_id=" . urlencode("' OR '1'='1"), 'GET');
$countSql = count($rSqlInject['data']['data'] ?? []);
record('SQL_SECURITY', 'baladiyas wilaya_id SQLi attempt', ($rSqlInject['code'] === 200 && $countSql === 0) ? 'PASS' : 'BLOCKER', "Returned $countSql baladiyas (parameter properly bound with 0 records returned)");

// --- 9. Medical Ticket Confidentiality Check ---
$medicalTicket = $pdo->query("SELECT id, patient_id, doctor_id FROM tickets WHERE doctor_id IS NOT NULL LIMIT 1")->fetch(PDO::FETCH_ASSOC);
if ($medicalTicket) {
    $tId = $medicalTicket['id'];
    $rTixAdmin   = curlReq("$baseUrl/tickets/$tId", 'GET', $tokenAdmin);
    $rTixSupport = curlReq("$baseUrl/tickets/$tId", 'GET', $tokenSupport);
    $rTixReplyAdmin = curlReq("$baseUrl/tickets/$tId/reply", 'POST', $tokenAdmin, ['message' => 'Admin test unauthorized reply']);

    record('CONFIDENTIALITY', 'Admin GET medical ticket', $rTixAdmin['code'] === 403 ? 'PASS' : 'BLOCKER', "HTTP {$rTixAdmin['code']} (expected 403)");
    record('CONFIDENTIALITY', 'Support GET medical ticket', $rTixSupport['code'] === 403 ? 'PASS' : 'BLOCKER', "HTTP {$rTixSupport['code']} (expected 403)");
    record('CONFIDENTIALITY', 'Admin POST reply medical ticket', $rTixReplyAdmin['code'] === 403 ? 'PASS' : 'BLOCKER', "HTTP {$rTixReplyAdmin['code']} (expected 403)");
} else {
    record('CONFIDENTIALITY', 'Medical ticket test', 'WARNING', 'No doctor ticket found to test live endpoint');
}

// --- 10. Audit IP Isolation in AuthController::me ---
$rMePatient = curlReq("$baseUrl/auth/me", 'GET', $tokenPatient);
$rMeAdmin   = curlReq("$baseUrl/auth/me", 'GET', $tokenAdmin);

$patientExposesIP = isset($rMePatient['data']['data']['profile']['current_session_ip']);
$adminHasAuditIP  = isset($rMeAdmin['data']['data']['profile']['current_session_ip']);

record('AUDIT_ISOLATION', 'Patient me() does NOT expose IP audit fields', !$patientExposesIP ? 'PASS' : 'FAIL', 'current_session_ip omitted for patients');
record('AUDIT_ISOLATION', 'Admin me() receives authenticated session audit', $adminHasAuditIP ? 'PASS' : 'FAIL', 'Admin profile receives own session audit');

// Clean up temporary tokens
$pdo->prepare("DELETE FROM sessions WHERE token LIKE 'audit_token_%'")->execute();

echo "\n===============================================================\n";
echo " AUDIT SUMMARY:\n";
$passCount = 0; $failCount = 0; $warnCount = 0; $blockerCount = 0;
foreach ($results as $r) {
    if ($r['status'] === 'PASS') $passCount++;
    if ($r['status'] === 'FAIL') $failCount++;
    if ($r['status'] === 'WARNING') $warnCount++;
    if ($r['status'] === 'BLOCKER') $blockerCount++;
}
echo " TOTAL TESTS : " . count($results) . "\n";
echo " PASS        : $passCount\n";
echo " WARNING     : $warnCount\n";
echo " FAIL        : $failCount\n";
echo " BLOCKER     : $blockerCount\n";
echo "===============================================================\n";
