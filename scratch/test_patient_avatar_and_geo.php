<?php
// scratch/test_patient_avatar_and_geo.php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/helpers/UUIDHelper.php';
require_once __DIR__ . '/../backend/helpers/PasswordHelper.php';

$pdo = Database::getInstance();

echo "=== 1. PREPARING TEST PATIENT & TOKENS ===\n";
// Find a patient user
$stmt = $pdo->query("SELECT u.id, u.username, p.id as patient_id, p.baladiya_id FROM users u JOIN patients p ON p.user_id = u.id WHERE u.usertype = 0 LIMIT 1");
$patientUser = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$patientUser) {
    die("Error: No patient found in database.\n");
}

echo "Found patient: {$patientUser['username']} (User ID: {$patientUser['id']}, Patient ID: {$patientUser['patient_id']})\n";

// Generate a test token
$sessionToken = bin2hex(random_bytes(32));
$pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")
    ->execute([$patientUser['id'], $sessionToken]);

// Find a wilaya and baladiya
$stmtW = $pdo->query("SELECT id, num, namefr, namear FROM wilayas ORDER BY num ASC LIMIT 1");
$wilaya = $stmtW->fetch(PDO::FETCH_ASSOC);
echo "Wilaya: {$wilaya['num']} - {$wilaya['namefr']} ({$wilaya['id']})\n";

$stmtB = $pdo->prepare("SELECT id, namefr, namear, postcode, wilaya_id FROM baladiyas WHERE wilaya_id = ? LIMIT 1");
$stmtB->execute([$wilaya['id']]);
$baladiya = $stmtB->fetch(PDO::FETCH_ASSOC);
echo "Baladiya: {$baladiya['namefr']} (Postcode: {$baladiya['postcode']}, ID: {$baladiya['id']})\n";

// Helper curl
function apiCall($url, $method = 'GET', $body = null, $token = null, $files = null) {
    $ch = curl_init("http://localhost:81/api" . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    $headers = [];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    if ($files) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $files);
    } elseif ($body !== null) {
        $headers[] = "Content-Type: application/json";
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'data' => json_decode($res, true), 'raw' => $res];
}

echo "\n=== 2. TEST GET /api/baladiyas?wilaya_id= ===\n";
$resB = apiCall("/baladiyas?wilaya_id=" . urlencode($wilaya['id']), 'GET');
echo "Status: {$resB['code']}\n";
$baladiyasCount = count($resB['data']['data'] ?? []);
echo "Returned $baladiyasCount baladiyas for Wilaya {$wilaya['namefr']}\n";
assert($resB['code'] === 200, "baladiyas call failed");
assert($baladiyasCount > 0, "No baladiyas returned");
assert($resB['data']['data'][0]['wilaya_id'] === $wilaya['id'], "Baladiya wilaya_id mismatch");
echo ">>> PASS: baladiyas filter by wilaya_id works properly.\n";

echo "\n=== 3. TEST GET /api/patients/profile ===\n";
$resP = apiCall("/patients/profile", 'GET', null, $sessionToken);
echo "Status: {$resP['code']}\n";
assert($resP['code'] === 200, "profile call failed");
echo "photoprofile key present in response: " . (array_key_exists('photoprofile', $resP['data']['data']) ? "YES" : "NO") . "\n";
echo "wilaya_id key present in response: " . (array_key_exists('wilaya_id', $resP['data']['data']) ? "YES" : "NO") . "\n";
assert(array_key_exists('photoprofile', $resP['data']['data']), "photoprofile missing");
assert(array_key_exists('wilaya_id', $resP['data']['data']), "wilaya_id missing");
echo ">>> PASS: Profile returns photoprofile and wilaya_id.\n";

echo "\n=== 4. TEST SECURITY ON POST /api/patients/photo ===\n";

// 4.1 No auth -> 401
$resNoAuth = apiCall("/patients/photo", 'POST');
echo "No Auth Status: {$resNoAuth['code']} (Expected: 401)\n";
assert($resNoAuth['code'] === 401, "Expected 401 on unauthenticated upload");

// 4.2 Empty / invalid file
$tmpEmpty = tempnam(sys_get_temp_dir(), 'test_empty');
$resEmpty = apiCall("/patients/photo", 'POST', null, $sessionToken, [
    'photo' => new CURLFile($tmpEmpty, 'image/jpeg', 'empty.jpg')
]);
echo "Empty file Status: {$resEmpty['code']} (Expected: 400)\n";
echo "Empty error: {$resEmpty['data']['message']}\n";
assert($resEmpty['code'] === 400, "Expected 400 on empty file");
unlink($tmpEmpty);

// 4.3 Malicious PHP file with .jpg extension
$tmpFake = tempnam(sys_get_temp_dir(), 'test_fake');
file_put_contents($tmpFake, "<?php phpinfo(); ?>");
$resFake = apiCall("/patients/photo", 'POST', null, $sessionToken, [
    'photo' => new CURLFile($tmpFake, 'image/jpeg', 'fake.jpg')
]);
echo "Fake JPG Status: {$resFake['code']} (Expected: 400)\n";
echo "Fake error: {$resFake['data']['message']}\n";
assert($resFake['code'] === 400, "Expected 400 on fake JPG");
unlink($tmpFake);

// 4.4 Genuine 1x1 GIF / PNG image
$tmpImg = tempnam(sys_get_temp_dir(), 'test_img') . '.png';
// 1x1 transparent PNG
file_put_contents($tmpImg, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='));
$resValid = apiCall("/patients/photo", 'POST', null, $sessionToken, [
    'photo' => new CURLFile($tmpImg, 'image/png', 'avatar.png')
]);
echo "Valid PNG Status: {$resValid['code']} (Expected: 200)\n";
echo "Valid response: {$resValid['data']['message']}\n";
assert($resValid['code'] === 200, "Expected 200 on valid upload");
assert(!empty($resValid['data']['data']['photoprofile']), "Expected base64 photoprofile in response");
unlink($tmpImg);

// Verify in DB that photoprofile is populated and non-empty
$stmtCheck = $pdo->prepare("SELECT LENGTH(photoprofile) as photo_len FROM patients WHERE id = ?");
$stmtCheck->execute([$patientUser['patient_id']]);
$photoLen = (int)$stmtCheck->fetchColumn();
echo "Database photoprofile BLOB size: $photoLen bytes\n";
assert($photoLen > 50, "Database photoprofile not saved");
echo ">>> PASS: Valid image persisted in DB.\n";

echo "\n=== 5. TEST UPDATE PROFILE WITH WILAYA / BALADIYA / ADDRESS ===\n";
$updatePayload = [
    'baladiya_id' => $baladiya['id'],
    'postcode'    => (int)$baladiya['postcode'],
    'address'     => '123 Rue de la Liberté, Cité Médicale'
];
$resUpdate = apiCall("/patients/profile", 'PUT', $updatePayload, $sessionToken);
echo "Update Status: {$resUpdate['code']}\n";
assert($resUpdate['code'] === 200, "Profile update failed");

// Re-fetch profile
$resP2 = apiCall("/patients/profile", 'GET', null, $sessionToken);
$pData = $resP2['data']['data'];
echo "Updated BaladiyaName: {$pData['BaladiyaName']} / {$pData['BaladiyaNameAr']}\n";
echo "Updated wilaya_id: {$pData['wilaya_id']} (Expected: {$wilaya['id']})\n";
echo "Updated postcode: {$pData['postcode']} (Expected: {$baladiya['postcode']})\n";
echo "Updated address: {$pData['address']}\n";
assert($pData['baladiya_id'] === $baladiya['id'], "baladiya_id not saved");
assert($pData['wilaya_id'] === $wilaya['id'], "wilaya_id not resolved");
assert((int)$pData['postcode'] === (int)$baladiya['postcode'], "postcode not saved");
assert($pData['address'] === '123 Rue de la Liberté, Cité Médicale', "address not saved");
echo ">>> PASS: Patient address, baladiya, and postcode updated and verified.\n";

// Cleanup test session
$pdo->prepare("DELETE FROM sessions WHERE token = ?")->execute([$sessionToken]);
echo "\n=== ALL 5 TESTS PASSED SUCCESSFULLY! ===\n";
