<?php
// ============================================================
// scratch/test_superadmin_api.php
// Script de test d'intégration des endpoints SuperAdmin
// ============================================================
declare(strict_types=1);

require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';
require_once __DIR__ . '/../backend/helpers/PasswordHelper.php';

$pdo = Database::getInstance();
$baseUrl = 'http://localhost:8000';

function callApi(string $method, string $path, ?array $body = null, ?string $token = null): array {
    global $baseUrl;
    $ch = curl_init($baseUrl . $path);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => json_decode((string)$res, true) ?: $res,
        'raw'  => (string)$res
    ];
}

function loginUser(string $username, string $password): ?string {
    $res = callApi('POST', '/auth/login', ['username' => $username, 'password' => $password]);
    if ($res['code'] === 200 && !empty($res['body']['data']['token'])) {
        return $res['body']['data']['token'];
    }
    return null;
}

echo "=== 1. TESTING TOKENS GENERATION ===\n";
// SuperAdmin (admin)
$superToken = loginUser('admin', 'password123');
if (!$superToken) {
    // Check if admin password is password123 or amar1990
    $superToken = loginUser('admin', 'admin123');
}
if (!$superToken) {
    // Try other known passwords or fetch from users
    $stmt = $pdo->query("SELECT id, password FROM users WHERE username = 'admin' LIMIT 1");
    $u = $stmt->fetch();
    echo "Admin found in DB: " . ($u ? "YES" : "NO") . "\n";
    // Let's create a temporary session token for testing
    $testToken = bin2hex(random_bytes(32));
    $pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")->execute([$u['id'], $testToken]);
    $superToken = $testToken;
}
echo "SuperAdmin Token: " . ($superToken ? "OK (" . substr($superToken, 0, 8) . "...)" : "FAIL") . "\n";

// Support Staff (support - usertype 4)
$supportUser = $pdo->query("SELECT id FROM users WHERE usertype = 4 LIMIT 1")->fetch();
$supportToken = bin2hex(random_bytes(32));
$pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")->execute([$supportUser['id'], $supportToken]);
echo "Support Token: OK\n";

// Patient (test_patient - usertype 0)
$patientUser = $pdo->query("SELECT id FROM users WHERE usertype = 0 LIMIT 1")->fetch();
$patientToken = bin2hex(random_bytes(32));
$pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")->execute([$patientUser['id'], $patientToken]);
echo "Patient Token: OK\n";

// Doctor (usertype 1)
$doctorUser = $pdo->query("SELECT id FROM users WHERE usertype = 1 LIMIT 1")->fetch();
$doctorToken = bin2hex(random_bytes(32));
$pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")->execute([$doctorUser['id'], $doctorToken]);
echo "Doctor Token: OK\n";

echo "\n=== 2. TESTING ACCESS CONTROL (RBAC) ===\n";
// Unauthenticated
$r0 = callApi('GET', '/superadmin/accounts');
echo "Unauthenticated -> Code: {$r0['code']} (Expected: 401) : " . ($r0['code'] === 401 ? "PASS" : "FAIL") . "\n";

// Patient
$rPatient = callApi('GET', '/superadmin/accounts', null, $patientToken);
echo "Patient -> Code: {$rPatient['code']} (Expected: 403) : " . ($rPatient['code'] === 403 ? "PASS" : "FAIL") . "\n";

// Doctor
$rDoctor = callApi('GET', '/superadmin/accounts', null, $doctorToken);
echo "Doctor -> Code: {$rDoctor['code']} (Expected: 403) : " . ($rDoctor['code'] === 403 ? "PASS" : "FAIL") . "\n";

// Admin / Support (usertype 4)
$rSupport = callApi('GET', '/superadmin/accounts', null, $supportToken);
echo "Support Admin -> Code: {$rSupport['code']} (Expected: 403) : " . ($rSupport['code'] === 403 ? "PASS" : "FAIL") . "\n";

// SuperAdmin (usertype 3)
$rSuper = callApi('GET', '/superadmin/accounts', null, $superToken);
echo "SuperAdmin -> Code: {$rSuper['code']} (Expected: 200) : " . ($rSuper['code'] === 200 ? "PASS" : "FAIL") . "\n";
if ($rSuper['code'] === 200) {
    $total = $rSuper['body']['data']['total'] ?? 0;
    $count = count($rSuper['body']['data']['items'] ?? []);
    echo "  Total accounts in DB: $total | Items returned on page 1: $count\n";
}

echo "\n=== 3. TESTING SEARCH & FILTERS ===\n";
// Search by username
$rSearch = callApi('GET', '/superadmin/accounts?q=admin', null, $superToken);
echo "Search 'admin' -> Items: " . count($rSearch['body']['data']['items'] ?? []) . " : " . (count($rSearch['body']['data']['items'] ?? []) > 0 ? "PASS" : "FAIL") . "\n";

// Filter by role = 0 (patients)
$rRole0 = callApi('GET', '/superadmin/accounts?role=0', null, $superToken);
$role0Count = $rRole0['body']['data']['total'] ?? 0;
echo "Filter role=0 (Patients) -> Total: $role0Count : " . ($role0Count === 5 ? "PASS" : "FAIL") . "\n";

// Filter by role = 3 (SuperAdmin)
$rRole3 = callApi('GET', '/superadmin/accounts?role=3', null, $superToken);
$role3Count = $rRole3['body']['data']['total'] ?? 0;
echo "Filter role=3 (SuperAdmin) -> Total: $role3Count : " . ($role3Count === 1 ? "PASS" : "FAIL") . "\n";

echo "\n=== 4. TESTING GET SINGLE ACCOUNT ===\n";
$firstId = $rSuper['body']['data']['items'][0]['id'] ?? null;
if ($firstId) {
    $rSingle = callApi('GET', '/superadmin/accounts/' . $firstId, null, $superToken);
    echo "Get single account ($firstId) -> Code: {$rSingle['code']} : " . ($rSingle['code'] === 200 ? "PASS" : "FAIL") . "\n";
    $hasPass = isset($rSingle['body']['data']['password']) || isset($rSingle['body']['data']['profile']['password']);
    echo "  No password in single response: " . (!$hasPass ? "PASS" : "FAIL") . "\n";
}

echo "\n=== 5. TESTING SECURITY GUARDS (PROTECT SUPERADMIN) ===\n";
// SuperAdmin attempting to freeze their own account
$superUserId = $pdo->query("SELECT id FROM users WHERE usertype = 3 LIMIT 1")->fetchColumn();
$rSelfFreeze = callApi('POST', '/superadmin/accounts/' . $superUserId . '/toggle-status', ['is_frozen' => true, 'reason' => 'test self freeze'], $superToken);
echo "Self freeze block -> Code: {$rSelfFreeze['code']} (Expected: 403) : " . ($rSelfFreeze['code'] === 403 ? "PASS" : "FAIL") . "\n";

// SuperAdmin attempting to anonymize their own account
$rSelfAnon = callApi('POST', '/superadmin/accounts/' . $superUserId . '/anonymize', null, $superToken);
echo "Self anonymize block -> Code: {$rSelfAnon['code']} (Expected: 403) : " . ($rSelfAnon['code'] === 403 ? "PASS" : "FAIL") . "\n";

// Clean up test sessions
$pdo->prepare("DELETE FROM sessions WHERE token IN (?, ?, ?, ?)")->execute([$superToken, $supportToken, $patientToken, $doctorToken]);
echo "\n=== TEST SESSIONS CLEANED UP ===\n";
