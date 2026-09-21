<?php
/**
 * AUDIT CIBLÉ POST-PHASE CONFIDENTIALITÉ 01
 * Test runner over genuine HTTP requests (Read-Only & Rejection tests).
 * STRICTLY NO DATABASE MODIFICATIONS.
 */

$baseUrl = 'http://localhost/tabibi/backend';

// Exact tokens from active sessions matching the owners of Ticket A and Ticket B
$tokens = [
    'admin'     => 'd24826c16cf05ddf7171dee3218a7e135015fa38e315749dd5cfba2c2424fc34', // usertype 3 (admin)
    'support'   => '8e3b3529492cf97e7e157358c2c181350e1a48f9dec4c801712b9980209556b2', // usertype 4 (support)
    'patient_a' => '8ab74258dad7fa713c4834efd14757ea4b7cd34e16221fdefc9f0f16e677c4c0', // test_pt_a (owns Ticket A)
    'doctor_a'  => '78268a9d421f2eb16746536f9ca05f7f0d91adcfc2c7ef5bbd7d5e965e9874a4', // test_doc_a (assigned to Ticket A)
    'patient_b' => '2d47f7308a4a3952b22610f5c2f0e5ea86bd659a630e1aa9598bb5a7a8da2efd', // amar1999 (owns Ticket B)
    'doctor_b'  => '27a3aa40bbb614edde810935e8ebfcc66edb40b88a9d3cdb0e898a266205483b', // benazet (assigned to Ticket B)
];

$ticketA = '4325e2b7-0dde-47a7-a609-c287608e7e8d'; // Status: OPEN, Patient A <-> Doctor A
$ticketB = '142a0756-6fdc-4ae3-8ea7-a9553be5f25c'; // Status: CLOSED, Patient B <-> Doctor B

function httpReq(string $method, string $path, ?string $token = null, ?array $body = null): array {
    global $baseUrl;
    $url = $baseUrl . $path;
    $ch = curl_init($url);
    $headers = ['Accept: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $json = json_decode($raw, true);
    return ['code' => $code, 'raw' => $raw, 'json' => $json];
}

$results = [];

function recordTest(string $title, bool $pass, string $details): void {
    global $results;
    $results[] = ['title' => $title, 'pass' => $pass, 'details' => $details];
    echo ($pass ? "[PASS] " : "[FAIL] ") . $title . "\n";
    echo "       " . $details . "\n";
}

echo "==============================================================\n";
echo " AUDIT TECHNIQUE CIBLÉ : POST-PHASE CONFIDENTIALITÉ 01 \n";
echo "==============================================================\n\n";

// ── TEST 1: Admin -> GET ticket clinique direct (Ticket A)
$r = httpReq('GET', "/tickets/$ticketA", $tokens['admin']);
$pass = ($r['code'] === 403);
$contentExposed = isset($r['json']['data']['messages']);
recordTest(
    "1. Admin (usertype 3) -> GET /tickets/:id (Ticket clinique)",
    $pass && !$contentExposed,
    "HTTP {$r['code']}, Message: " . ($r['json']['message'] ?? 'none') . " | Content exposed: " . ($contentExposed ? 'YES' : 'NO')
);

// ── TEST 2: Support -> GET ticket clinique direct (Ticket A)
$r = httpReq('GET', "/tickets/$ticketA", $tokens['support']);
$pass = ($r['code'] === 403);
$contentExposed = isset($r['json']['data']['messages']);
recordTest(
    "2. Support (usertype 4) -> GET /tickets/:id (Ticket clinique)",
    $pass && !$contentExposed,
    "HTTP {$r['code']}, Message: " . ($r['json']['message'] ?? 'none') . " | Content exposed: " . ($contentExposed ? 'YES' : 'NO')
);

// ── TEST 3: Admin -> GET /tickets (liste des tickets)
$r = httpReq('GET', '/tickets', $tokens['admin']);
$pass = ($r['code'] === 200);
$leakedMessages = 0;
if (isset($r['json']['data']) && is_array($r['json']['data'])) {
    foreach ($r['json']['data'] as $tk) {
        if (!empty($tk['last_message'])) {
            $leakedMessages++;
        }
    }
}
recordTest(
    "3. Admin -> GET /tickets (Vérification last_message = NULL)",
    $pass && ($leakedMessages === 0),
    "HTTP {$r['code']}, Total tickets: " . count($r['json']['data'] ?? []) . " | Tickets avec last_message fuité: $leakedMessages"
);

// ── TEST 4: Support -> GET /tickets (liste des tickets)
$r = httpReq('GET', '/tickets', $tokens['support']);
$pass = ($r['code'] === 200);
$leakedMessages = 0;
if (isset($r['json']['data']) && is_array($r['json']['data'])) {
    foreach ($r['json']['data'] as $tk) {
        if (!empty($tk['last_message'])) {
            $leakedMessages++;
        }
    }
}
recordTest(
    "4. Support -> GET /tickets (Vérification last_message = NULL)",
    $pass && ($leakedMessages === 0),
    "HTTP {$r['code']}, Total tickets: " . count($r['json']['data'] ?? []) . " | Tickets avec last_message fuité: $leakedMessages"
);

// ── TEST 5: Admin -> POST /tickets/:id/reply (Tentative d'ingérence)
$r = httpReq('POST', "/tickets/$ticketA/reply", $tokens['admin'], ['message' => 'Tentative admin']);
$pass = ($r['code'] === 403);
recordTest(
    "5. Admin -> POST /tickets/:id/reply (Tentative d'ingérence)",
    $pass,
    "HTTP {$r['code']}, Message: " . ($r['json']['message'] ?? 'none')
);

// ── TEST 6: Support -> POST /tickets/:id/reply (Tentative d'ingérence)
$r = httpReq('POST', "/tickets/$ticketA/reply", $tokens['support'], ['message' => 'Tentative support']);
$pass = ($r['code'] === 403);
recordTest(
    "6. Support -> POST /tickets/:id/reply (Tentative d'ingérence)",
    $pass,
    "HTTP {$r['code']}, Message: " . ($r['json']['message'] ?? 'none')
);

// ── TEST 7: Endpoint alternatif éventuel: Admin -> GET /chat/threads
$r = httpReq('GET', '/chat/threads', $tokens['admin']);
$pass = ($r['code'] === 403);
recordTest(
    "7. Admin -> GET /chat/threads (Endpoint alternatif)",
    $pass,
    "HTTP {$r['code']}, Message: " . ($r['json']['message'] ?? 'none')
);

// ── TEST 8: Endpoint alternatif éventuel: Admin -> GET /chat/threads/any-id/messages
$r = httpReq('GET', '/chat/threads/test-id/messages', $tokens['admin']);
$pass = ($r['code'] === 403 || $r['code'] === 404);
recordTest(
    "8. Admin -> GET /chat/threads/:id/messages (Endpoint alternatif)",
    $pass,
    "HTTP {$r['code']}, Message: " . ($r['json']['message'] ?? 'none')
);

// ── TEST 9: Patient A -> GET sa propre conversation (Ticket A)
$r = httpReq('GET', "/tickets/$ticketA", $tokens['patient_a']);
$pass = ($r['code'] === 200 && isset($r['json']['data']['messages']));
recordTest(
    "9. Patient A -> GET son propre ticket (Ticket A)",
    $pass,
    "HTTP {$r['code']}, Messages récupérés: " . count($r['json']['data']['messages'] ?? [])
);

// ── TEST 10: Médecin A -> GET sa propre conversation (Ticket A)
$r = httpReq('GET', "/tickets/$ticketA", $tokens['doctor_a']);
$pass = ($r['code'] === 200 && isset($r['json']['data']['messages']));
recordTest(
    "10. Médecin A -> GET son propre ticket (Ticket A)",
    $pass,
    "HTTP {$r['code']}, Messages récupérés: " . count($r['json']['data']['messages'] ?? [])
);

// ── TEST 11: IDOR: Patient A -> GET Ticket Patient B (Ticket B)
$r = httpReq('GET', "/tickets/$ticketB", $tokens['patient_a']);
$pass = ($r['code'] === 403);
recordTest(
    "11. IDOR: Patient A -> GET Ticket de Patient B (Ticket B)",
    $pass,
    "HTTP {$r['code']}, Message: " . ($r['json']['message'] ?? 'none')
);

// ── TEST 12: IDOR: Médecin A -> GET Ticket Médecin B (Ticket B)
$r = httpReq('GET', "/tickets/$ticketB", $tokens['doctor_a']);
$pass = ($r['code'] === 403);
recordTest(
    "12. IDOR: Médecin A -> GET Ticket de Médecin B (Ticket B)",
    $pass,
    "HTTP {$r['code']}, Message: " . ($r['json']['message'] ?? 'none')
);

// ── TEST 13: IDOR: Patient B -> POST reply sur Ticket A (Ticket ouvert d'un autre patient)
$r = httpReq('POST', "/tickets/$ticketA/reply", $tokens['patient_b'], ['message' => 'Tentative IDOR Patient B sur Ticket A']);
$pass = ($r['code'] === 403);
recordTest(
    "13. IDOR: Patient B -> POST reply sur Ticket Patient A (Ticket A ouvert)",
    $pass,
    "HTTP {$r['code']}, Message: " . ($r['json']['message'] ?? 'none')
);

// ── TEST 14: IDOR: Médecin B -> POST reply sur Ticket A (Ticket ouvert d'un autre médecin)
$r = httpReq('POST', "/tickets/$ticketA/reply", $tokens['doctor_b'], ['message' => 'Tentative IDOR Médecin B sur Ticket A']);
$pass = ($r['code'] === 403);
recordTest(
    "14. IDOR: Médecin B -> POST reply sur Ticket Médecin A (Ticket A ouvert)",
    $pass,
    "HTTP {$r['code']}, Message: " . ($r['json']['message'] ?? 'none')
);

// ── TEST 15: Admin -> GET /admin/support-tickets (Canal officiel support administratif)
$r = httpReq('GET', '/admin/support-tickets', $tokens['admin']);
$pass = ($r['code'] === 200);
recordTest(
    "15. Admin -> GET /admin/support-tickets (Canal administratif officiel)",
    $pass,
    "HTTP {$r['code']}, Total tickets support admin: " . count($r['json']['data'] ?? [])
);

// ── TEST 16: Capacité de réponse légitime Patient & Médecin
// Envoi avec message vide pour vérifier que la requête passe le RBAC et atteint la validation 422
$rPat = httpReq('POST', "/tickets/$ticketA/reply", $tokens['patient_a'], ['message' => '']);
$rDoc = httpReq('POST', "/tickets/$ticketA/reply", $tokens['doctor_a'], ['message' => '']);
$pass = ($rPat['code'] === 422 && $rDoc['code'] === 422);
recordTest(
    "16. Capacité de réponse Patient & Médecin (RBAC validé sans altération de données)",
    $pass,
    "Patient code: {$rPat['code']} (" . ($rPat['json']['message'] ?? '') . ") | Doctor code: {$rDoc['code']} (" . ($rDoc['json']['message'] ?? '') . ")"
);

echo "\n==============================================================\n";
$total = count($results);
$passed = count(array_filter($results, fn($t) => $t['pass']));
echo " BILAN : $passed / $total TESTS PASS\n";
echo "==============================================================\n";
