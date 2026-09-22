<?php
// Test relations/requests endpoint as a clinic and as a doctor user
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

// Get a clinic user session
$stmtClinic = $pdo->query("SELECT s.token, u.usertype FROM sessions s JOIN users u ON s.user_id = u.id WHERE u.usertype = 2 ORDER BY s.id DESC LIMIT 1");
$rowClinic = $stmtClinic->fetch(PDO::FETCH_ASSOC);

// Get a doctor user session
$stmtDoctor = $pdo->query("SELECT s.token, u.usertype FROM sessions s JOIN users u ON s.user_id = u.id WHERE u.usertype = 1 ORDER BY s.id DESC LIMIT 1");
$rowDoctor = $stmtDoctor->fetch(PDO::FETCH_ASSOC);

function testEndpoint($label, $token) {
    if (!$token) { echo "SKIP: No $label session found\n"; return; }
    $urls = [
        "http://localhost/tabibi/backend/index.php/relations/requests",
        "http://localhost:81/backend/index.php/relations/requests",
        "http://localhost:81/tabibi/backend/index.php/relations/requests",
    ];
    foreach ($urls as $url) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ["Authorization: Bearer $token", "Accept: application/json"],
            CURLOPT_TIMEOUT => 5,
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        if ($code === 0) { continue; } // skip unreachable
        echo "\n[$label] $url → HTTP $code\n";
        if ($resp) {
            $d = json_decode($resp, true);
            if ($d && isset($d['success'])) {
                echo "  success=" . ($d['success'] ? 'true' : 'false') . " message=" . ($d['message'] ?? 'N/A') . "\n";
                if ($d['success'] && isset($d['data'])) {
                    echo "  data count=" . (is_array($d['data']) ? count($d['data']) : 'not array') . "\n";
                }
            } else {
                echo "  raw: " . substr($resp, 0, 200) . "\n";
            }
        }
        if ($err) echo "  curl_error: $err\n";
        break; // try first working URL only
    }
}

echo "=== Clinic user ===\n";
testEndpoint("Clinic", $rowClinic['token'] ?? null);

echo "\n=== Doctor user ===\n";
testEndpoint("Doctor", $rowDoctor['token'] ?? null);

// Check RelationController directly
echo "\n=== RelationController::getRequests PHP test ===\n";
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/core/Response.php';
require_once __DIR__ . '/../backend/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../backend/controllers/RelationController.php';
echo "RelationController class exists: " . (class_exists('RelationController') ? 'YES' : 'NO') . "\n";
echo "getRequests method exists: " . (method_exists('RelationController', 'getRequests') ? 'YES' : 'NO') . "\n";
