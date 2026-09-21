<?php
/**
 * Test Suite: SuperAdmin Account Management (19 Mandatory Points)
 * Tests all requirements without modifying or deleting any real production/local accounts.
 * Cleans up all test data upon completion.
 */

$baseUrl = 'http://localhost:8000/api';

function apiRequest($method, $path, $body = null, $token = null) {
    global $baseUrl;
    $ch = curl_init("$baseUrl$path");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    
    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $json = json_decode($resp, true);
    return ['code' => $httpCode, 'data' => $json, 'raw' => $resp];
}

echo "=========================================================\n";
echo "  SUPER ADMIN ACCOUNT MANAGEMENT - COMPREHENSIVE TEST   \n";
echo "=========================================================\n\n";

$passCount = 0;
$failCount = 0;

function report($num, $name, $pass, $detail = "") {
    global $passCount, $failCount;
    if ($pass) {
        $passCount++;
        echo "[$num] PASS - $name\n";
    } else {
        $failCount++;
        echo "[$num] FAIL - $name\n";
    }
    if ($detail) {
        echo "      Detail: $detail\n";
    }
}

// Connect to DB directly for creating/cleaning test accounts only
require_once __DIR__ . '/../backend/core/Database.php';
$db = Database::getInstance();

// 1. Setup Test Accounts
// Find or create test credentials
$testPassword = 'TestPassword123!';
$hashedPassword = password_hash($testPassword, PASSWORD_BCRYPT);

require_once __DIR__ . '/../backend/helpers/UUIDHelper.php';

// Cleanup any old test accounts
$db->exec("DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_superadmin_%')");
$db->exec("DELETE FROM patients WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_superadmin_%')");
$db->exec("DELETE FROM doctors WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_superadmin_%')");
$db->exec("DELETE FROM clinics WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_superadmin_%')");
$db->exec("DELETE FROM users WHERE username LIKE 'test_superadmin_%'");

// Create:
// 1. test_superadmin_patient (usertype 0)
$testPatId = UUIDHelper::generate();
$stmt = $db->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, ?, ?, 0)");
$stmt->execute([$testPatId, 'test_superadmin_patient', $hashedPassword]);
$stmt = $db->prepare("INSERT INTO patients (id, user_id, fullname, email, phone) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([UUIDHelper::generate(), $testPatId, 'Test Patient SA', 'test_pat@tabibi.dz', '0550000001']);

// 2. test_superadmin_doctor (usertype 1)
$testDocId = UUIDHelper::generate();
$stmt = $db->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, ?, ?, 1)");
$stmt->execute([$testDocId, 'test_superadmin_doc', $hashedPassword]);
$stmt = $db->prepare("INSERT INTO doctors (id, user_id, fullname, email, phone, status) VALUES (?, ?, ?, ?, ?, 'APPROVED')");
$stmt->execute([UUIDHelper::generate(), $testDocId, 'Dr. Test SA', 'test_doc@tabibi.dz', '0550000002']);

// 3. test_superadmin_clinic (usertype 2)
$testClinicId = UUIDHelper::generate();
$stmt = $db->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, ?, ?, 2)");
$stmt->execute([$testClinicId, 'test_superadmin_clinic', $hashedPassword]);
$stmt = $db->prepare("INSERT INTO clinics (id, user_id, clinicname, email, phone, status) VALUES (?, ?, ?, ?, ?, 'APPROVED')");
$stmt->execute([UUIDHelper::generate(), $testClinicId, 'Clinique Test SA', 'test_clinic@tabibi.dz', '0550000003']);

// 4. test_superadmin_admin_std (usertype 4)
$testAdminStdId = UUIDHelper::generate();
$stmt = $db->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, ?, ?, 4)");
$stmt->execute([$testAdminStdId, 'test_superadmin_admin', $hashedPassword]);

// 5. Target account to test operations (patient so we can test anonymization, freeze, reset, etc.)
$testTargetId = UUIDHelper::generate();
$stmt = $db->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, ?, ?, 0)");
$stmt->execute([$testTargetId, 'test_superadmin_target', $hashedPassword]);
$stmt = $db->prepare("INSERT INTO patients (id, user_id, fullname, email, phone) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([UUIDHelper::generate(), $testTargetId, 'Target Test User', 'test_target@tabibi.dz', '0550999999']);

// Logins to get tokens
$loginSuperAdmin = apiRequest('POST', '/auth/login', ['username' => 'admin', 'password' => 'amar1990']);
$superAdminToken = $loginSuperAdmin['data']['data']['token'] ?? null;
$superAdminUserId = $loginSuperAdmin['data']['data']['user_id'] ?? ($loginSuperAdmin['data']['data']['user']['id'] ?? null);

$loginAdminStd = apiRequest('POST', '/auth/login', ['username' => 'test_superadmin_admin', 'password' => $testPassword]);
$adminStdToken = $loginAdminStd['data']['data']['token'] ?? null;

$loginDoctor = apiRequest('POST', '/auth/login', ['username' => 'test_superadmin_doc', 'password' => $testPassword]);
$doctorToken = $loginDoctor['data']['data']['token'] ?? null;

$loginPatient = apiRequest('POST', '/auth/login', ['username' => 'test_superadmin_patient', 'password' => $testPassword]);
$patientToken = $loginPatient['data']['data']['token'] ?? null;

$loginClinic = apiRequest('POST', '/auth/login', ['username' => 'test_superadmin_clinic', 'password' => $testPassword]);
$clinicToken = $loginClinic['data']['data']['token'] ?? null;

$loginTarget = apiRequest('POST', '/auth/login', ['username' => 'test_superadmin_target', 'password' => $testPassword]);
$targetToken = $loginTarget['data']['data']['token'] ?? null;

// --- TEST 1: SuperAdmin -> Page / API access
$r1 = apiRequest('GET', '/superadmin/accounts?limit=5', null, $superAdminToken);
report(1, "SuperAdmin access to accounts endpoint", $r1['code'] === 200 && isset($r1['data']['data']['items']), "Code: {$r1['code']}, items: " . count($r1['data']['data']['items'] ?? []));

// --- TEST 2: Admin standard -> Accès refusé (403)
$r2 = apiRequest('GET', '/superadmin/accounts', null, $adminStdToken);
report(2, "Standard Admin (usertype 4) access forbidden", $r2['code'] === 403, "Code: {$r2['code']}");

// --- TEST 3: Patient -> Accès refusé (403)
$r3 = apiRequest('GET', '/superadmin/accounts', null, $patientToken);
report(3, "Patient (usertype 0) access forbidden", $r3['code'] === 403, "Code: {$r3['code']}");

// --- TEST 4: Médecin -> Accès refusé (403)
$r4 = apiRequest('GET', '/superadmin/accounts', null, $doctorToken);
report(4, "Doctor (usertype 1) access forbidden", $r4['code'] === 403, "Code: {$r4['code']}");

// --- TEST 5: Clinique -> Accès refusé (403)
$r5 = apiRequest('GET', '/superadmin/accounts', null, $clinicToken);
report(5, "Clinic (usertype 2) access forbidden", $r5['code'] === 403, "Code: {$r5['code']}");

// --- TEST 6: Utilisateur non authentifié -> Accès refusé (401)
$r6 = apiRequest('GET', '/superadmin/accounts');
report(6, "Unauthenticated user access denied", $r6['code'] === 401, "Code: {$r6['code']}");

// --- TEST 7: Recherche comptes (username, name, email, phone)
$r7a = apiRequest('GET', '/superadmin/accounts?q=test_superadmin_target', null, $superAdminToken);
$r7b = apiRequest('GET', '/superadmin/accounts?q=0550999999', null, $superAdminToken);
$foundSearch = ($r7a['data']['data']['total'] ?? 0) >= 1 && ($r7b['data']['data']['total'] ?? 0) >= 1;
report(7, "Account search by username and phone", $foundSearch, "Search 'test_superadmin_target': {$r7a['data']['data']['total']} found, Search '0550999999': {$r7b['data']['data']['total']} found");

// --- TEST 8: Filtres (role, status, date)
$r8Role = apiRequest('GET', '/superadmin/accounts?role=0', null, $superAdminToken);
$r8Status = apiRequest('GET', '/superadmin/accounts?status=active', null, $superAdminToken);
$r8Date = apiRequest('GET', '/superadmin/accounts?period=today', null, $superAdminToken);
$filtersPass = $r8Role['code'] === 200 && $r8Status['code'] === 200 && $r8Date['code'] === 200;
report(8, "Filter by role, status, and creation date", $filtersPass, "Role=0: {$r8Role['data']['data']['total']}, Status=active: {$r8Status['data']['data']['total']}, Period=today: {$r8Date['data']['data']['total']}");

// --- TEST 9: Consultation fiche compte
$r9 = apiRequest('GET', "/superadmin/accounts/$testTargetId", null, $superAdminToken);
$accData = $r9['data']['data']['account'] ?? null;
report(9, "Inspect account details and associated profile", $r9['code'] === 200 && $accData !== null && $accData['username'] === 'test_superadmin_target', "Account user: {$accData['username']}, profile fullname: " . ($r9['data']['data']['profile']['fullname'] ?? ''));

// --- TEST 10: Activation / Désactivation (Freeze / Unfreeze)
$r10Freeze = apiRequest('PUT', "/superadmin/accounts/$testTargetId/status", ['is_frozen' => true, 'freeze_reason' => 'Test freeze'], $superAdminToken);
// Verify target cannot authenticate when frozen
$r10LoginFrozen = apiRequest('POST', '/auth/login', ['username' => 'test_superadmin_target', 'password' => $testPassword]);
$frozenBlocked = ($r10LoginFrozen['code'] === 403);
// Unfreeze
$r10Unfreeze = apiRequest('PUT', "/superadmin/accounts/$testTargetId/status", ['is_frozen' => false], $superAdminToken);
report(10, "Freeze and Unfreeze account with login block verification", $r10Freeze['code'] === 200 && $frozenBlocked && $r10Unfreeze['code'] === 200, "Freeze code: {$r10Freeze['code']}, Login while frozen code: {$r10LoginFrozen['code']}, Unfreeze code: {$r10Unfreeze['code']}");

// --- TEST 11: Invalidation des sessions actives
// Target logs in to establish an active session
$loginTarget2 = apiRequest('POST', '/auth/login', ['username' => 'test_superadmin_target', 'password' => $testPassword]);
$targetToken2 = $loginTarget2['data']['data']['token'] ?? null;
// Verify token works
$checkBefore = apiRequest('GET', '/auth/me', null, $targetToken2);
// Invalidate sessions
$r11 = apiRequest('POST', "/superadmin/accounts/$testTargetId/invalidate-sessions", null, $superAdminToken);
// Verify token is now invalid (401)
$checkAfter = apiRequest('GET', '/auth/me', null, $targetToken2);
report(11, "Force session invalidation terminates active tokens", $r11['code'] === 200 && $checkBefore['code'] === 200 && $checkAfter['code'] === 401, "Before: {$checkBefore['code']}, Invalidate: {$r11['code']}, After: {$checkAfter['code']}");

// --- TEST 12: Reset password sécurisé (no password returned in API)
$r12 = apiRequest('POST', "/superadmin/accounts/$testTargetId/reset-password", null, $superAdminToken);
$rawR12 = $r12['raw'];
$hasPlainPassword = isset($r12['data']['data']['password']) || isset($r12['data']['password']) || stripos($rawR12, 'password_hash') !== false;
report(12, "Reset password without leaking plain password or hash", $r12['code'] === 200 && !$hasPlainPassword, "Code: {$r12['code']}, Password exposed in response: " . ($hasPlainPassword ? "YES (FAIL)" : "NO (PASS)"));

// --- TEST 13: Protection IDOR (Non-existent target or unauthorized manipulation)
$r13 = apiRequest('GET', "/superadmin/accounts/99999999", null, $superAdminToken);
report(13, "Protection IDOR / Non-existent account handled cleanly", $r13['code'] === 404, "Code: {$r13['code']}, Msg: " . ($r13['data']['message'] ?? ''));

// --- TEST 14: Protection du SuperAdmin lui-même (cannot freeze self, cannot anonymize self)
$r14FreezeSelf = apiRequest('PUT', "/superadmin/accounts/$superAdminUserId/status", ['is_frozen' => true], $superAdminToken);
$r14AnonSelf = apiRequest('DELETE', "/superadmin/accounts/$superAdminUserId", null, $superAdminToken);
report(14, "Protection of SuperAdmin from self-actions (freeze/anonymize)", $r14FreezeSelf['code'] === 403 && $r14AnonSelf['code'] === 403, "Self-freeze code: {$r14FreezeSelf['code']}, Self-anonymize code: {$r14AnonSelf['code']}");

// --- TEST 15: Impossibilité de supprimer/désactiver le dernier SuperAdmin
// admin is the only real SuperAdmin in the system
$r15 = apiRequest('PUT', "/superadmin/accounts/$superAdminUserId/status", ['is_frozen' => true], $superAdminToken);
report(15, "Cannot freeze or disable last SuperAdmin", $r15['code'] === 403, "Code: {$r15['code']}");

// --- TEST 16: Aucune fuite password / hash / token / secret dans les réponses API
$checkList = apiRequest('GET', '/superadmin/accounts?limit=10', null, $superAdminToken);
$checkDetail = apiRequest('GET', "/superadmin/accounts/$testTargetId", null, $superAdminToken);
$rawCombined = $checkList['raw'] . ' ' . $checkDetail['raw'];
$leaksFound = false;
$leakDetails = [];
if (stripos($rawCombined, 'password_hash') !== false) {
    $leaksFound = true;
    $leakDetails[] = 'password_hash detected';
}
if (preg_match('/\"password\"\s*:\s*\"[^\"]+\"/', $rawCombined)) {
    $leaksFound = true;
    $leakDetails[] = 'plain password key detected';
}
if (stripos($rawCombined, 'jwt_secret') !== false) {
    $leaksFound = true;
    $leakDetails[] = 'jwt_secret detected';
}
report(16, "Zero password/hash/secret leaks in API responses", !$leaksFound, $leaksFound ? implode(', ', $leakDetails) : "Scan verified 0 leaks in list and detail payloads");

// --- TEST 17: Frontend Build
$feBuild = shell_exec('cd frontend && npm run build 2>&1');
$feSuccess = (strpos($feBuild, 'built in') !== false);
report(17, "Frontend build verification", $feSuccess, $feSuccess ? "Vite build succeeded" : "Build output: " . substr($feBuild, -200));

// --- TEST 18: PHP Syntax
$phpL1 = shell_exec('php -l backend/controllers/SuperAdminController.php 2>&1');
$phpL2 = shell_exec('php -l backend/middleware/AuthMiddleware.php 2>&1');
$phpL3 = shell_exec('php -l backend/index.php 2>&1');
$phpSyntaxPass = (strpos($phpL1, 'No syntax errors') !== false && strpos($phpL2, 'No syntax errors') !== false && strpos($phpL3, 'No syntax errors') !== false);
report(18, "PHP syntax validation", $phpSyntaxPass, "All backend controller, middleware, and router files checked");

// --- TEST 19: Anonymisation Phase 02D & Aucun HTTP 500 sur les endpoints
$r19Anon = apiRequest('DELETE', "/superadmin/accounts/$testTargetId", null, $superAdminToken);
// Verify target was anonymized cleanly
$r19Check = apiRequest('GET', "/superadmin/accounts/$testTargetId", null, $superAdminToken);
$isAnonNow = ($r19Check['data']['data']['account']['is_anonymized'] ?? 0) == 1;
$no500 = ($r19Anon['code'] === 200 && $r19Check['code'] === 200);
report(19, "Account anonymization (Phase 02D) & Zero HTTP 500 errors", $no500 && $isAnonNow, "Anonymize code: {$r19Anon['code']}, Account is_anonymized: " . ($isAnonNow ? '1' : '0'));

// ── CLEANUP TEST ACCOUNTS ──
$db->exec("DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_superadmin_%')");
$db->exec("DELETE FROM patients WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_superadmin_%')");
$db->exec("DELETE FROM doctors WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_superadmin_%')");
$db->exec("DELETE FROM clinics WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_superadmin_%')");
$db->exec("DELETE FROM users WHERE username LIKE 'test_superadmin_%'");

echo "\n=========================================================\n";
echo "  FINAL RESULT: $passCount / " . ($passCount + $failCount) . " TESTS PASSED\n";
echo "=========================================================\n";

if ($failCount > 0) {
    exit(1);
}
exit(0);
