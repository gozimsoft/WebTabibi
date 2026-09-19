<?php
require_once __DIR__ . '/../backend/core/Database.php';

function apiCall($method, $path, $token = null) {
    $ch = curl_init("http://localhost:8000/api" . $path);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    $headers = ['Content-Type: application/json'];
    if ($token) $headers[] = 'Authorization: Bearer ' . $token;
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'body' => json_decode($res, true)];
}

$pdo = Database::getInstance();
// Get admin token
$admin = $pdo->query("SELECT id FROM users WHERE usertype IN (3, 4) LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$adminToken = bin2hex(random_bytes(32));
$pdo->prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, NOW())")->execute([$adminToken, $admin['id']]);

// Get patient token
$patient = $pdo->query("SELECT id FROM users WHERE usertype = 0 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$patientToken = bin2hex(random_bytes(32));
$pdo->prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, NOW())")->execute([$patientToken, $patient['id']]);

echo "Testing Admin Pagination...\n";
$resAdminP1 = apiCall('GET', '/admin/support-tickets?page=1&limit=5', $adminToken);
echo "Admin Page 1 HTTP: " . $resAdminP1['code'] . "\n";
echo "Admin Page 1 items count: " . count($resAdminP1['body']['data']['items']) . "\n";
echo "Admin Page 1 page: " . $resAdminP1['body']['data']['page'] . "\n";
echo "Admin Page 1 limit: " . $resAdminP1['body']['data']['limit'] . "\n";
echo "Admin Page 1 total: " . $resAdminP1['body']['data']['total'] . "\n";
echo "Admin Page 1 total_pages: " . $resAdminP1['body']['data']['total_pages'] . "\n";

$resAdminP2 = apiCall('GET', '/admin/support-tickets?page=2&limit=5', $adminToken);
echo "Admin Page 2 HTTP: " . $resAdminP2['code'] . "\n";
echo "Admin Page 2 items count: " . count($resAdminP2['body']['data']['items']) . "\n";
echo "Admin Page 2 page: " . $resAdminP2['body']['data']['page'] . "\n";

// Verify that items on page 1 and page 2 are different (no overlap)
$ids1 = array_column($resAdminP1['body']['data']['items'], 'id');
$ids2 = array_column($resAdminP2['body']['data']['items'], 'id');
$overlap = array_intersect($ids1, $ids2);
echo "Admin P1 & P2 Overlap count (expected 0): " . count($overlap) . "\n";

echo "\nTesting User Tickets Paginated...\n";
$resUserPaginated = apiCall('GET', '/support/tickets?page=1&limit=5', $patientToken);
echo "User Paginated HTTP: " . $resUserPaginated['code'] . "\n";
echo "User Paginated is structured array with items: " . (isset($resUserPaginated['body']['data']['items']) ? 'YES' : 'NO') . "\n";
if (isset($resUserPaginated['body']['data']['items'])) {
    echo "User Paginated items count: " . count($resUserPaginated['body']['data']['items']) . "\n";
    echo "User Paginated total: " . $resUserPaginated['body']['data']['total'] . "\n";
    echo "User Paginated total_pages: " . $resUserPaginated['body']['data']['total_pages'] . "\n";
}

echo "\nTesting User Tickets Backward-Compatible (Unpaginated)...\n";
$resUserFlat = apiCall('GET', '/support/tickets', $patientToken);
echo "User Flat HTTP: " . $resUserFlat['code'] . "\n";
echo "User Flat is array directly: " . (isset($resUserFlat['body']['data']) && is_array($resUserFlat['body']['data']) && !isset($resUserFlat['body']['data']['items']) ? 'YES' : 'NO') . "\n";
echo "User Flat count: " . count($resUserFlat['body']['data']) . "\n";

// Cleanup test sessions
$pdo->prepare("DELETE FROM sessions WHERE token IN (?, ?)")->execute([$adminToken, $patientToken]);
echo "\nALL PAGINATION CHECKS COMPLETED.\n";
