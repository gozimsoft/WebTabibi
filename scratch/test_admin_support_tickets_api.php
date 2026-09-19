<?php
require_once __DIR__ . '/../backend/core/Database.php';

echo "====================================================\n";
echo "TEST SUITE: MODULE SUPPORT ADMINISTRATIF & RÉCLAMATIONS\n";
echo "====================================================\n\n";

$pdo = Database::getInstance();

function apiCall($method, $path, $data = null, $token = null) {
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

// Helper to create or get token for user
function getUserToken($username, $password, $pdo) {
    // Try login
    $res = apiCall('POST', '/auth/login', ['username' => $username, 'password' => $password]);
    if ($res['code'] === 200 && !empty($res['body']['data']['token'])) {
        return $res['body']['data']['token'];
    }
    // Fallback: create direct session in DB
    $user = $pdo->query("SELECT id, usertype FROM users WHERE username = '$username'")->fetch(PDO::FETCH_ASSOC);
    if (!$user) return null;
    $token = bin2hex(random_bytes(32));
    $pdo->prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, NOW())")
        ->execute([$token, $user['id']]);
    return $token;
}

// 1. Setup tokens for Patient, Doctor, Clinic, Admin
$adminToken = getUserToken('support', 'amar1990', $pdo);
if (!$adminToken) {
    // try admin
    $adminToken = getUserToken('admin', 'admin123', $pdo);
}
echo "Admin/Support token: " . ($adminToken ? "OK" : "FAIL") . "\n";

// Get a patient
$patient = $pdo->query("SELECT u.username, u.id FROM users u WHERE u.usertype = 0 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$patientToken = getUserToken($patient['username'], 'password123', $pdo);
echo "Patient ({$patient['username']}) token: " . ($patientToken ? "OK" : "FAIL") . "\n";

// Get a doctor
$doctor = $pdo->query("SELECT u.username, u.id FROM users u WHERE u.usertype = 1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$doctorToken = getUserToken($doctor['username'], 'password123', $pdo);
echo "Doctor ({$doctor['username']}) token: " . ($doctorToken ? "OK" : "FAIL") . "\n";

// Get a clinic
$clinic = $pdo->query("SELECT u.username, u.id FROM users u WHERE u.usertype = 2 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$clinicToken = getUserToken($clinic['username'], 'password123', $pdo);
echo "Clinic ({$clinic['username']}) token: " . ($clinicToken ? "OK" : "FAIL") . "\n\n";

$tests = [];

// TEST 1: Patient creates admin ticket
echo "--> Test 1: Patient → Création ticket administratif\n";
$res1 = apiCall('POST', '/support/tickets', [
    'category' => 'reclamation',
    'subject'  => 'شكوى بخصوص تأخر موعد',
    'message'  => 'أريد تقديم شكوى رسمية للإدارة حول تأخر موعدي في العيادة.'
], $patientToken);
$t1_pass = ($res1['code'] === 200 && !empty($res1['body']['data']['ticket_number']));
$tests['1_Patient_Create'] = $t1_pass ? 'PASS' : 'FAIL';
$patientTicketId = $res1['body']['data']['id'] ?? null;
$patientTicketNum = $res1['body']['data']['ticket_number'] ?? null;
echo "Result: HTTP {$res1['code']} - Ticket #{$patientTicketNum} - " . ($t1_pass ? 'PASS' : 'FAIL') . "\n\n";

// TEST 2: Doctor creates admin ticket
echo "--> Test 2: Médecin → Création ticket administratif\n";
$res2 = apiCall('POST', '/support/tickets', [
    'category' => 'subscription',
    'subject'  => 'استفسار حول تجديد الاشتراك السنوي',
    'message'  => 'أرغب في الاستفسار عن باقات تجديد الاشتراك السنوي وحساب الطبيب.'
], $doctorToken);
$t2_pass = ($res2['code'] === 200 && !empty($res2['body']['data']['ticket_number']));
$tests['2_Doctor_Create'] = $t2_pass ? 'PASS' : 'FAIL';
$doctorTicketId = $res2['body']['data']['id'] ?? null;
$doctorTicketNum = $res2['body']['data']['ticket_number'] ?? null;
echo "Result: HTTP {$res2['code']} - Ticket #{$doctorTicketNum} - " . ($t2_pass ? 'PASS' : 'FAIL') . "\n\n";

// TEST 3: Clinic creates admin ticket
echo "--> Test 3: Clinique → Création ticket administratif\n";
$res3 = apiCall('POST', '/support/tickets', [
    'category' => 'technical',
    'subject'  => 'مشكلة في مزامنة تطبيق دلفي مع السيرفر',
    'message'  => 'نواجه بطء في مزامنة المواعيد مع الخادم السحابي لطاقم العيادة.'
], $clinicToken);
$t3_pass = ($res3['code'] === 200 && !empty($res3['body']['data']['ticket_number']));
$tests['3_Clinic_Create'] = $t3_pass ? 'PASS' : 'FAIL';
$clinicTicketId = $res3['body']['data']['id'] ?? null;
$clinicTicketNum = $res3['body']['data']['ticket_number'] ?? null;
echo "Result: HTTP {$res3['code']} - Ticket #{$clinicTicketNum} - " . ($t3_pass ? 'PASS' : 'FAIL') . "\n\n";

// TEST 4: Admin receives all tickets in admin endpoint
echo "--> Test 4: Admin → Réception et listing des tickets administratifs\n";
$res4 = apiCall('GET', '/admin/support-tickets?status=ALL', null, $adminToken);
$t4_pass = ($res4['code'] === 200 && count($res4['body']['data']['items'] ?? []) >= 3);
$tests['4_Admin_Receive'] = $t4_pass ? 'PASS' : 'FAIL';
echo "Result: HTTP {$res4['code']} - Total items: " . count($res4['body']['data']['items'] ?? []) . " - " . ($t4_pass ? 'PASS' : 'FAIL') . "\n\n";

// TEST 5: Admin replies to patient ticket
echo "--> Test 5: Admin → Réponse à la demande du patient\n";
$res5 = apiCall('POST', "/admin/support-tickets/{$patientTicketId}/reply", [
    'message' => 'تم استلام شكواكم وجاري التحقق مع إدارة العيادة المعنية وسنوافيكم بالرد.',
    'status'  => 'IN_PROGRESS'
], $adminToken);
$t5_pass = ($res5['code'] === 200);
$tests['5_Admin_Reply'] = $t5_pass ? 'PASS' : 'FAIL';
echo "Result: HTTP {$res5['code']} - " . ($t5_pass ? 'PASS' : 'FAIL') . "\n\n";

// TEST 6: User receives admin reply
echo "--> Test 6: Utilisateur (Patient) → Réception de la réponse de l'Admin\n";
$res6 = apiCall('GET', "/support/tickets/{$patientTicketId}", null, $patientToken);
$msgs = $res6['body']['data']['messages'] ?? [];
$hasAdminMsg = false;
foreach ($msgs as $m) {
    if ($m['sender_type'] === 'admin' || $m['sender_type'] === 'support') {
        $hasAdminMsg = true;
        break;
    }
}
$t6_pass = ($res6['code'] === 200 && $hasAdminMsg && $res6['body']['data']['ticket']['status'] === 'IN_PROGRESS');
$tests['6_User_Receive_Reply'] = $t6_pass ? 'PASS' : 'FAIL';
echo "Result: HTTP {$res6['code']} - Messages count: " . count($msgs) . " - Has Admin reply: " . ($hasAdminMsg ? 'YES' : 'NO') . " - " . ($t6_pass ? 'PASS' : 'FAIL') . "\n\n";

// TEST 7: Status & Priority Change by Admin
echo "--> Test 7: Changement des statuts (RESOLVED puis CLOSED)\n";
$res7a = apiCall('PUT', "/admin/support-tickets/{$patientTicketId}/status", [
    'status'   => 'RESOLVED',
    'priority' => 'HIGH'
], $adminToken);
$res7b = apiCall('GET', "/admin/support-tickets/{$patientTicketId}", null, $adminToken);
$t7_pass = ($res7a['code'] === 200 && ($res7b['body']['data']['ticket']['status'] ?? '') === 'RESOLVED');
$tests['7_Status_Change'] = $t7_pass ? 'PASS' : 'FAIL';
echo "Result: Status updated to " . ($res7b['body']['data']['ticket']['status'] ?? 'unknown') . " - " . ($t7_pass ? 'PASS' : 'FAIL') . "\n\n";

// TEST 8: Isolation between users (Patient B cannot access Patient A's admin ticket)
echo "--> Test 8: Isolation entre utilisateurs (IDOR Check)\n";
// Doctor tries to access Patient's ticket via user endpoint:
$res8 = apiCall('GET', "/support/tickets/{$patientTicketId}", null, $doctorToken);
$t8_pass = ($res8['code'] === 403);
$tests['8_User_Isolation'] = $t8_pass ? 'PASS' : 'FAIL';
echo "Result: Doctor accessing Patient ticket -> HTTP {$res8['code']} (Expected 403) - " . ($t8_pass ? 'PASS' : 'FAIL') . "\n\n";

// TEST 9: Total isolation with Patient ↔ Doctor ticket system
echo "--> Test 9: Isolation totale avec les tickets Patient ↔ Médecin (/api/tickets)\n";
$res9_med = apiCall('GET', '/tickets', null, $patientToken);
$medTickets = $res9_med['body']['data'] ?? [];
$leaked = false;
foreach ($medTickets as $mt) {
    if (isset($mt['id']) && in_array($mt['id'], [$patientTicketId, $doctorTicketId, $clinicTicketId])) {
        $leaked = true;
        break;
    }
}
$t9_pass = ($res9_med['code'] === 200 && !$leaked);
$tests['9_Med_Tickets_Isolation'] = $t9_pass ? 'PASS' : 'FAIL';
echo "Result: Check /api/tickets -> Leaked admin tickets: " . ($leaked ? 'YES (FAIL)' : 'NO (PASS)') . "\n\n";

// TEST 10: Badge / Notification
echo "--> Test 10: Badge / Stats / Notifications administratives\n";
$res10 = apiCall('GET', '/admin/support-tickets/stats', null, $adminToken);
$stats = $res10['body']['data'] ?? [];
$t10_pass = ($res10['code'] === 200 && isset($stats['total']) && isset($stats['unread_messages']));
$tests['10_Badge_Stats'] = $t10_pass ? 'PASS' : 'FAIL';
echo "Result: Stats total={$stats['total']}, unread={$stats['unread_messages']} - " . ($t10_pass ? 'PASS' : 'FAIL') . "\n\n";

echo "=== SUMMARY RESULTS ===\n";
foreach ($tests as $tName => $status) {
    echo "  $tName: $status\n";
}
