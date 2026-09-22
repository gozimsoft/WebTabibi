<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/helpers/PasswordHelper.php';

$pdo = Database::getInstance();

echo "=== Test Sécurité updateCredentials ===\n";

$testUserId = 'test-sec-uuid-' . bin2hex(random_bytes(4));
$testToken  = 'test_sec_token_' . bin2hex(random_bytes(16));
$initialPlainPassword = 'CurrentSecret123!';
$initialHash = PasswordHelper::hash($initialPlainPassword);

// 1. Create temporary test user
$stmt = $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, ?, ?, 0)");
$stmt->execute([$testUserId, 'test_sec_user_' . substr(md5(microtime()), 0, 6), $initialHash]);

// 2. Create session
$stmt = $pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())");
$stmt->execute([$testUserId, $testToken]);

function callApi($data, $token) {
    $url = 'http://localhost:81/api/patients/credentials';
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token,
    ]);
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $status, 'body' => json_decode($res, true)];
}

// TEST 1: Change password WITHOUT current_password -> Expect 422
$r1 = callApi(['new_password' => 'NewSecret456!'], $testToken);
echo "Test 1 (sans current_password) - Status: {$r1['status']} | Message: " . ($r1['body']['message'] ?? '') . "\n";
assert($r1['status'] === 422, "Test 1 failed: status should be 422");

// TEST 2: Change password WITH WRONG current_password -> Expect 401
$r2 = callApi(['current_password' => 'WrongPassword!', 'new_password' => 'NewSecret456!'], $testToken);
echo "Test 2 (mauvais current_password) - Status: {$r2['status']} | Message: " . ($r2['body']['message'] ?? '') . "\n";
assert($r2['status'] === 401, "Test 2 failed: status should be 401");

// TEST 3: Change password WITH TOO SHORT new_password -> Expect 422
$r3 = callApi(['current_password' => $initialPlainPassword, 'new_password' => '123'], $testToken);
echo "Test 3 (new_password trop court) - Status: {$r3['status']} | Message: " . ($r3['body']['message'] ?? '') . "\n";
assert($r3['status'] === 422, "Test 3 failed: status should be 422");

// TEST 4: Change password WITH CORRECT current_password -> Expect 200
$r4 = callApi(['current_password' => $initialPlainPassword, 'new_password' => 'NewValidSecret456!'], $testToken);
echo "Test 4 (succès changement mot de passe) - Status: {$r4['status']} | Success: " . json_encode($r4['body']['success'] ?? false) . "\n";
assert($r4['status'] === 200, "Test 4 failed: status should be 200");

// Check DB that password updated and verifies with new password
$stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
$stmt->execute([$testUserId]);
$newHashInDb = $stmt->fetchColumn();
assert(PasswordHelper::verify('NewValidSecret456!', $newHashInDb), "DB hash does not match new password");
assert(!PasswordHelper::verify($initialPlainPassword, $newHashInDb), "DB hash still matches old password");
echo "Test 4 DB Verification: Password successfully updated & verified with Bcrypt!\n";

// TEST 5: Change username only without password -> Expect 200
$newUname = 'new_username_' . substr(md5(microtime()), 0, 6);
$r5 = callApi(['new_username' => $newUname], $testToken);
echo "Test 5 (changement nom d'utilisateur seul) - Status: {$r5['status']} | Success: " . json_encode($r5['body']['success'] ?? false) . "\n";
assert($r5['status'] === 200, "Test 5 failed: status should be 200");

// Cleanup
$pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$testUserId]);
$pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$testUserId]);

echo "=== TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS (5/5) ===\n";
