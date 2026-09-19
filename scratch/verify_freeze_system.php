<?php
require_once __DIR__ . '/../backend/core/Database.php';

echo "=== STARTING FREEZE & RELEASE VERIFICATION ===\n";

$db = Database::getInstance();

// 1. Verify Support User
$stmt = $db->prepare("SELECT id, username, usertype FROM users WHERE username = 'support'");
$stmt->execute();
$supportUser = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$supportUser) {
    echo "❌ Support user not found!\n";
    exit(1);
}
echo "✅ Support user exists: id={$supportUser['id']}, TypeUser={$supportUser['TypeUser']}\n";

// Login as support via API
function apiReq($method, $path, $data = null, $token = null) {
    $url = "http://localhost:8000/api" . $path;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'body' => json_decode($response, true) ?? $response
    ];
}

$loginRes = apiReq('POST', '/auth/login', [
    'username' => 'support',
    'password' => 'amar1990'
]);

$token = $loginRes['body']['data']['token'] ?? $loginRes['body']['token'] ?? null;
if ($loginRes['code'] !== 200 || !$token) {
    echo "❌ Failed to login as support: " . json_encode($loginRes) . "\n";
    exit(1);
}
echo "✅ Logged in as support, token received!\n";

// Find an approved doctor to test
$docStmt = $db->query("SELECT d.id, d.fullname, d.user_id, u.username, d.is_frozen 
                       FROM doctors d 
                       JOIN users u ON d.user_id = u.id 
                       LIMIT 1");
$testDoc = $docStmt->fetch(PDO::FETCH_ASSOC);

if (!$testDoc) {
    echo "❌ No doctor found to test!\n";
    exit(1);
}

$docId = $testDoc['id'];
$docUsername = $testDoc['username'];
$docUserId = $testDoc['user_id'];
echo "ℹ️ Testing with Doctor ID={$docId}, Name={$testDoc['fullname']}, UserID={$docUserId}, Username={$docUsername}\n";

// 2. Freeze Doctor
echo "--> Calling POST /admin/doctors/{$docId}/freeze\n";
$freezeRes = apiReq('POST', "/admin/doctors/{$docId}/freeze", [
    'reason' => 'اختبار تجميد الحساب لانتهاء الاشتراك السنوي التجريبي'
], $token);

echo "Freeze response: HTTP {$freezeRes['code']} - " . json_encode($freezeRes['body'], JSON_UNESCAPED_UNICODE) . "\n";
if ($freezeRes['code'] !== 200) {
    echo "❌ Freeze doctor failed!\n";
    exit(1);
}

// 3. Verify DB state for Doctor
$checkStmt = $db->prepare("SELECT is_frozen, freeze_reason, frozen_at FROM doctors WHERE id = ?");
$checkStmt->execute([$docId]);
$docRow = $checkStmt->fetch(PDO::FETCH_ASSOC);

if ($docRow['is_frozen'] != 1) {
    echo "❌ Doctor is_frozen is not 1 in DB!\n";
    exit(1);
}
echo "✅ Doctor DB updated: is_frozen=1, reason='{$docRow['freeze_reason']}', frozen_at='{$docRow['frozen_at']}'\n";

// Check registration table
$regStmt = $db->prepare("SELECT is_frozen, freeze_reason FROM doctorregistrations WHERE email = (SELECT email FROM doctors WHERE id = ?)");
$regStmt->execute([$docId]);
$regRow = $regStmt->fetch(PDO::FETCH_ASSOC);
if ($regRow) {
    echo "✅ Doctor registration table also synced: is_frozen={$regRow['is_frozen']}\n";
}

// 4. Test Login of Frozen Doctor
echo "--> Testing login of frozen doctor...\n";
$docLoginRes = apiReq('POST', '/auth/login', [
    'username' => $docUsername,
    'password' => 'password123' // may fail password or fail frozen
]);
echo "Doctor login response code: {$docLoginRes['code']}\n";
echo "Doctor login response body: " . json_encode($docLoginRes['body'], JSON_UNESCAPED_UNICODE) . "\n";

// 5. Test Filter GET /admin/doctors?status=FROZEN
$frozenListRes = apiReq('GET', '/admin/doctors?status=FROZEN', null, $token);
echo "GET /admin/doctors?status=FROZEN response code: {$frozenListRes['code']}\n";
$frozenCount = count($frozenListRes['body']['items'] ?? []);
echo "Found {$frozenCount} frozen doctors in filter. StatusCounts: " . json_encode($frozenListRes['body']['counts'] ?? []) . "\n";
if ($frozenCount === 0) {
    echo "❌ Expected at least 1 frozen doctor in list!\n";
    exit(1);
}
echo "✅ FROZEN filter successfully returned frozen doctor!\n";

// 6. Release Doctor
echo "--> Calling POST /admin/doctors/{$docId}/release\n";
$releaseRes = apiReq('POST', "/admin/doctors/{$docId}/release", [], $token);
echo "Release response: HTTP {$releaseRes['code']} - " . json_encode($releaseRes['body'], JSON_UNESCAPED_UNICODE) . "\n";
if ($releaseRes['code'] !== 200) {
    echo "❌ Release doctor failed!\n";
    exit(1);
}

// 7. Verify DB state after release
$checkStmt->execute([$docId]);
$docRowAfter = $checkStmt->fetch(PDO::FETCH_ASSOC);
if ($docRowAfter['is_frozen'] != 0 || $docRowAfter['freeze_reason'] !== null) {
    echo "❌ Doctor is_frozen is not 0 after release!\n";
    exit(1);
}
echo "✅ Doctor DB released: is_frozen=0, freeze_reason=NULL\n";

// 8. Find Clinic to test
$clinicStmt = $db->query("SELECT c.id, c.clinicname, c.user_id, c.is_frozen 
                         FROM clinics c 
                         LIMIT 1");
$testClinic = $clinicStmt->fetch(PDO::FETCH_ASSOC);

if ($testClinic) {
    $clinicId = $testClinic['id'];
    echo "ℹ️ Testing Clinic ID={$clinicId}, Name={$testClinic['clinicname']}\n";
    
    // Freeze Clinic
    $freezeClinicRes = apiReq('POST', "/admin/clinics/{$clinicId}/freeze", [
        'reason' => 'تجميد تجريبي للعيادة'
    ], $token);
    echo "Freeze clinic HTTP {$freezeClinicRes['code']}\n";
    
    $checkClinicStmt = $db->prepare("SELECT is_frozen, freeze_reason FROM clinics WHERE id = ?");
    $checkClinicStmt->execute([$clinicId]);
    $clinicRow = $checkClinicStmt->fetch(PDO::FETCH_ASSOC);
    if ($clinicRow['is_frozen'] != 1) {
        echo "❌ Clinic is_frozen is not 1!\n";
        exit(1);
    }
    echo "✅ Clinic DB is_frozen=1\n";
    
    // Release Clinic
    $releaseClinicRes = apiReq('POST', "/admin/clinics/{$clinicId}/release", [], $token);
    echo "Release clinic HTTP {$releaseClinicRes['code']}\n";
    
    $checkClinicStmt->execute([$clinicId]);
    $clinicRowAfter = $checkClinicStmt->fetch(PDO::FETCH_ASSOC);
    if ($clinicRowAfter['is_frozen'] != 0) {
        echo "❌ Clinic is_frozen is not 0 after release!\n";
        exit(1);
    }
    echo "✅ Clinic DB released: is_frozen=0\n";
}

echo "=== ALL FREEZE & RELEASE BACKEND TESTS PASSED SUCCESSFULLY! ===\n";
