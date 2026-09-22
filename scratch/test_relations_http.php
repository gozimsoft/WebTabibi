<?php
// Test the relations/requests endpoint via the proper URL path that frontend uses
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

// Get a clinic user token
$stmt = $pdo->query("SELECT s.token, u.usertype, u.id as uid FROM sessions s JOIN users u ON s.user_id = u.id WHERE u.usertype = 2 ORDER BY s.id DESC LIMIT 1");
$clinic = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$clinic) { die("No clinic session found\n"); }

// Get a doctor user token
$stmt2 = $pdo->query("SELECT s.token, u.usertype, u.id as uid FROM sessions s JOIN users u ON s.user_id = u.id WHERE u.usertype = 1 ORDER BY s.id DESC LIMIT 1");
$doctor = $stmt2->fetch(PDO::FETCH_ASSOC);

function testUrl($label, $token, $url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ["Authorization: Bearer $token", "Accept: application/json"],
        CURLOPT_TIMEOUT => 5,
        CURLOPT_FOLLOWLOCATION => true,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "[$label] $url → HTTP $code\n";
    if ($resp) {
        $d = json_decode($resp, true);
        if (is_array($d)) {
            echo "  success=" . ($d['success'] ? 'true' : 'false') . "\n";
            if ($d['success']) {
                $count = is_array($d['data']) ? count($d['data']) : 'N/A';
                echo "  data count=$count\n";
            } else {
                echo "  message=" . ($d['message'] ?? 'N/A') . "\n";
            }
        } else {
            echo "  raw: " . substr($resp, 0, 300) . "\n";
        }
    }
    echo "\n";
}

// Test via Apache on port 80 (the proxy target)
$urls = [
    "http://localhost/tabibi/backend/api/relations/requests",
    "http://localhost/tabibi/backend/index.php/api/relations/requests",
    "http://localhost/tabibi/backend/relations/requests",
];

echo "=== Clinic User (type 2) ===\n";
foreach ($urls as $url) {
    testUrl("Clinic", $clinic['token'], $url);
}

if ($doctor) {
    echo "=== Doctor User (type 1) ===\n";
    foreach ($urls as $url) {
        testUrl("Doctor", $doctor['token'], $url);
    }
}

// Direct PHP test (bypassing HTTP)
echo "=== Direct PHP Test (AuthMiddleware simulation) ===\n";
// Simulate the REQUEST_URI
$_SERVER['REQUEST_URI'] = '/tabibi/backend/api/relations/requests';
$_SERVER['REQUEST_METHOD'] = 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
$uri = preg_replace('#^/tabibi/backend#', '', $uri);
$uri = preg_replace('#^/api#', '', $uri);
echo "Parsed URI: '$uri'\n";
echo "Expected: '/relations/requests'\n";
echo "Match: " . ($uri === '/relations/requests' ? 'YES' : 'NO') . "\n";
