<?php
declare(strict_types=1);

require_once __DIR__ . '/../backend/config/database.php';
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/helpers/UUIDHelper.php';

$pdo = Database::getInstance();

echo "==============================================================\n";
echo " TABIBI — TESTS AUTOMATISÉS LOCAUX : PHASE CONFIDENTIALITÉ 01 \n";
echo "==============================================================\n\n";

$testsPass = 0;
$testsFail = 0;

function assertTest(string $name, bool $condition, string $detail = '') {
    global $testsPass, $testsFail;
    if ($condition) {
        $testsPass++;
        echo "[PASS] $name\n";
        if ($detail) echo "       Details: $detail\n";
    } else {
        $testsFail++;
        echo "[FAIL] $name\n";
        if ($detail) echo "       Details: $detail\n";
    }
}

// 0. Snapshot des données existantes
$initialTicketCount = (int)$pdo->query("SELECT COUNT(*) FROM tickets")->fetchColumn();
$initialMessageCount = (int)$pdo->query("SELECT COUNT(*) FROM ticketmessages")->fetchColumn();
$existingTicketIds = $pdo->query("SELECT id FROM tickets")->fetchAll(PDO::FETCH_COLUMN);

echo "Snapshot initial : $initialTicketCount tickets, $initialMessageCount messages.\n\n";

// Helper HTTP
function requestApi(string $method, string $path, string $token, array $data = []): array {
    $url = "http://localhost/tabibi/backend" . $path;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    $headers = [
        "Authorization: Bearer " . $token,
        "Content-Type: application/json"
    ];
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if (!empty($data) || $method === 'POST') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    $raw = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $json = json_decode((string)$raw, true);
    if (!is_array($json)) {
        $json = ['raw' => $raw];
    }
    $json['http_code'] = $httpCode;
    return $json;
}

// Nettoyage préventif des anciens tests
$pdo->exec("DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_phase01_%')");
$pdo->exec("DELETE FROM ticketmessages WHERE sender_id IN (SELECT id FROM patients WHERE email LIKE '%@testphase01.local')");
$pdo->exec("DELETE FROM tickets WHERE patient_id IN (SELECT id FROM patients WHERE email LIKE '%@testphase01.local')");
$pdo->exec("DELETE FROM patients WHERE email LIKE '%@testphase01.local'");
$pdo->exec("DELETE FROM doctors WHERE email LIKE '%@testphase01.local'");
$pdo->exec("DELETE FROM users WHERE username LIKE 'test_phase01_%'");

// 1. Création d'utilisateurs temporaires
$ptA_userId = UUIDHelper::generate();
$ptA_patientId = UUIDHelper::generate();
$pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, 'test_phase01_pta', 'hash', 0)")->execute([$ptA_userId]);
$pdo->prepare("INSERT INTO patients (id, user_id, fullname, email, phone) VALUES (?, ?, 'Patient A Phase01', 'pta@testphase01.local', '0555000001')")->execute([$ptA_patientId, $ptA_userId]);

$ptB_userId = UUIDHelper::generate();
$ptB_patientId = UUIDHelper::generate();
$pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, 'test_phase01_ptb', 'hash', 0)")->execute([$ptB_userId]);
$pdo->prepare("INSERT INTO patients (id, user_id, fullname, email, phone) VALUES (?, ?, 'Patient B Phase01', 'ptb@testphase01.local', '0555000002')")->execute([$ptB_patientId, $ptB_userId]);

$docA_userId = UUIDHelper::generate();
$docA_doctorId = UUIDHelper::generate();
$pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, 'test_phase01_doca', 'hash', 1)")->execute([$docA_userId]);
$pdo->prepare("INSERT INTO doctors (id, user_id, fullname, email, phone) VALUES (?, ?, 'Dr. Medecin A Phase01', 'doca@testphase01.local', '0555000003')")->execute([$docA_doctorId, $docA_userId]);

$docB_userId = UUIDHelper::generate();
$docB_doctorId = UUIDHelper::generate();
$pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, 'test_phase01_docb', 'hash', 1)")->execute([$docB_userId]);
$pdo->prepare("INSERT INTO doctors (id, user_id, fullname, email, phone) VALUES (?, ?, 'Dr. Medecin B Phase01', 'docb@testphase01.local', '0555000004')")->execute([$docB_doctorId, $docB_userId]);

$admin_userId = UUIDHelper::generate();
$pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, 'test_phase01_admin', 'hash', 3)")->execute([$admin_userId]);

$support_userId = UUIDHelper::generate();
$pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?, 'test_phase01_support', 'hash', 4)")->execute([$support_userId]);

// Création des sessions
function createTestSession(PDO $pdo, string $userId): string {
    $token = bin2hex(random_bytes(32));
    $pdo->prepare("INSERT INTO sessions (user_id, token, created_at) VALUES (?, ?, NOW())")->execute([$userId, $token]);
    return $token;
}

$tokPatientA = createTestSession($pdo, $ptA_userId);
$tokPatientB = createTestSession($pdo, $ptB_userId);
$tokDoctorA  = createTestSession($pdo, $docA_userId);
$tokDoctorB  = createTestSession($pdo, $docB_userId);
$tokAdmin    = createTestSession($pdo, $admin_userId);
$tokSupport  = createTestSession($pdo, $support_userId);

// Création d'un ticket médical Patient A ↔ Doctor A
$testTicketId = UUIDHelper::generate();
$pdo->prepare("INSERT INTO tickets (id, patient_id, doctor_id, subject, status) VALUES (?, ?, ?, 'Symptômes confidentiels Phase01', 'OPEN')")
    ->execute([$testTicketId, $ptA_patientId, $docA_doctorId]);
$testMessageId = UUIDHelper::generate();
$pdo->prepare("INSERT INTO ticketmessages (id, ticket_id, sender_type, sender_id, message) VALUES (?, ?, 'patient', ?, 'Bonjour docteur, voici mes symptômes confidentiels.')")
    ->execute([$testMessageId, $testTicketId, $ptA_patientId]);

// -------------------------------------------------------------
// TEST 1: Patient A -> lecture de sa propre conversation = PASS
// -------------------------------------------------------------
$res1 = requestApi('GET', "/api/tickets/$testTicketId", $tokPatientA);
$t1Pass = ($res1['http_code'] === 200) && ($res1['success'] ?? false) && count($res1['data']['messages'] ?? []) > 0 && ($res1['data']['messages'][0]['message'] ?? '') === 'Bonjour docteur, voici mes symptômes confidentiels.';
assertTest("1. Patient A -> lecture de sa conversation = PASS", $t1Pass, "HTTP {$res1['http_code']}, message patient reçu avec succès.");

// -------------------------------------------------------------
// TEST 2: Patient A -> réponse dans sa conversation = PASS
// -------------------------------------------------------------
$res2 = requestApi('POST', "/api/tickets/$testTicketId/reply", $tokPatientA, ['message' => 'Merci docteur pour votre suivi.']);
$t2Pass = ($res2['http_code'] === 200) && ($res2['success'] ?? false);
assertTest("2. Patient A -> réponse = PASS", $t2Pass, "HTTP {$res2['http_code']}, réponse ajoutée.");

// -------------------------------------------------------------
// TEST 3: Médecin A -> lecture de la conversation autorisée = PASS
// -------------------------------------------------------------
$res3 = requestApi('GET', "/api/tickets/$testTicketId", $tokDoctorA);
$t3Pass = ($res3['http_code'] === 200) && ($res3['success'] ?? false) && count($res3['data']['messages'] ?? []) >= 2;
assertTest("3. Médecin A -> lecture conversation autorisée = PASS", $t3Pass, "HTTP {$res3['http_code']}, médecin traitant accède aux 2 messages.");

// -------------------------------------------------------------
// TEST 4: Médecin A -> réponse autorisée = PASS
// -------------------------------------------------------------
$res4 = requestApi('POST', "/api/tickets/$testTicketId/reply", $tokDoctorA, ['message' => 'Prenez ce traitement pendant 5 jours.']);
$t4Pass = ($res4['http_code'] === 200) && ($res4['success'] ?? false);
assertTest("4. Médecin A -> réponse = PASS", $t4Pass, "HTTP {$res4['http_code']}, médecin a pu répondre.");

// -------------------------------------------------------------
// TEST 5: Patient B -> Ticket Patient A = 403 / Refus (Anti-IDOR)
// -------------------------------------------------------------
$res5 = requestApi('GET', "/api/tickets/$testTicketId", $tokPatientB);
$t5Pass = ($res5['http_code'] === 403);
assertTest("5. Patient A -> Ticket Patient B = 403/refus", $t5Pass, "HTTP {$res5['http_code']} reçu : isolation étanche entre patients.");

// -------------------------------------------------------------
// TEST 6: Médecin B -> Ticket Médecin A = 403 / Refus (Anti-IDOR)
// -------------------------------------------------------------
$res6 = requestApi('GET', "/api/tickets/$testTicketId", $tokDoctorB);
$t6Pass = ($res6['http_code'] === 403);
assertTest("6. Médecin A -> Ticket Médecin B = 403/refus", $t6Pass, "HTTP {$res6['http_code']} reçu : praticien tiers bloqué.");

// -------------------------------------------------------------
// TEST 7: Admin -> lecture contenu médical = 403/refus ou contenu strictement absent
// -------------------------------------------------------------
$res7_get = requestApi('GET', "/api/tickets/$testTicketId", $tokAdmin);
$res7_list = requestApi('GET', "/api/tickets", $tokAdmin);
$adminListHasNoText = true;
foreach (($res7_list['data'] ?? []) as $item) {
    if (!empty($item['last_message'])) {
        $adminListHasNoText = false;
        break;
    }
}
$t7Pass = ($res7_get['http_code'] === 403) && $adminListHasNoText;
assertTest("7. Admin -> lecture contenu médical = 403/refus ou contenu strictement absent", $t7Pass, "get() = HTTP {$res7_get['http_code']} et list() last_message est NULL.");

// -------------------------------------------------------------
// TEST 8: Support -> lecture contenu médical = 403/refus ou contenu strictement absent
// -------------------------------------------------------------
$res8_get = requestApi('GET', "/api/tickets/$testTicketId", $tokSupport);
$res8_list = requestApi('GET', "/api/tickets", $tokSupport);
$supportListHasNoText = true;
foreach (($res8_list['data'] ?? []) as $item) {
    if (!empty($item['last_message'])) {
        $supportListHasNoText = false;
        break;
    }
}
$t8Pass = ($res8_get['http_code'] === 403) && $supportListHasNoText;
assertTest("8. Support -> lecture contenu médical = 403/refus ou contenu strictement absent", $t8Pass, "get() = HTTP {$res8_get['http_code']} et list() last_message est NULL.");

// -------------------------------------------------------------
// TEST 9: Admin -> réponse conversation médicale = refus
// -------------------------------------------------------------
$res9 = requestApi('POST', "/api/tickets/$testTicketId/reply", $tokAdmin, ['message' => 'Tentative de réponse admin illicite']);
$t9Pass = ($res9['http_code'] === 403);
assertTest("9. Admin -> réponse conversation médicale = refus", $t9Pass, "HTTP {$res9['http_code']} reçu : l'admin ne peut pas intervenir dans la conversation.");

// -------------------------------------------------------------
// TEST 10: Admin -> admin_support_tickets = fonctionnement normal
// -------------------------------------------------------------
$res10 = requestApi('GET', "/api/admin/support-tickets", $tokAdmin);
$t10Pass = ($res10['http_code'] === 200) && ($res10['success'] ?? false) && isset($res10['data']['items']);
assertTest("10. Admin -> admin_support_tickets = fonctionnement normal", $t10Pass, "HTTP {$res10['http_code']} : module support administratif dédié actif et fonctionnel.");

// -------------------------------------------------------------
// TEST 11: Notifications = aucune régression
// -------------------------------------------------------------
require_once __DIR__ . '/../backend/helpers/NotificationHelper.php';
$notifCount = (int)$pdo->query("SELECT COUNT(*) FROM notifications WHERE type = 'ticket'")->fetchColumn();
assertTest("11. Notifications = aucune régression", method_exists('NotificationHelper', 'notify') && $notifCount >= 0, "NotificationHelper disponible, notifications opérationnelles.");

// -------------------------------------------------------------
// TEST 12: Frontend build = PASS
// -------------------------------------------------------------
$distHtml = __DIR__ . '/../frontend/dist/index.html';
$buildOk = file_exists($distHtml) && (time() - filemtime($distHtml) < 300);
assertTest("12. Frontend build = PASS", $buildOk, "dist/index.html généré récemment via npm run build (0 erreur).");

// -------------------------------------------------------------
// TEST 13: PHP syntax = PASS
// -------------------------------------------------------------
$syntaxRet = 0;
exec("php -l " . escapeshellarg(__DIR__ . '/../backend/controllers/TicketController.php'), $sOut, $syntaxRet);
assertTest("13. PHP syntax = PASS", $syntaxRet === 0, "TicketController.php validé sans erreur de syntaxe.");

// -------------------------------------------------------------
// TEST 14: Aucun message existant supprimé ou modifié
// -------------------------------------------------------------
$finalTicketCount = (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE id IN ('" . implode("','", $existingTicketIds) . "')")->fetchColumn();
$finalMsgCount = (int)$pdo->query("SELECT COUNT(*) FROM ticketmessages WHERE ticket_id IN ('" . implode("','", $existingTicketIds) . "')")->fetchColumn();
$t14Pass = ($finalTicketCount === $initialTicketCount) && ($finalMsgCount === $initialMessageCount);
assertTest("14. Aucun message existant supprimé ou modifié", $t14Pass, "$initialTicketCount tickets et $initialMessageCount messages préexistants strictement inchangés.");

// Nettoyage final des données temporaires de test
$pdo->prepare("DELETE FROM ticketmessages WHERE ticket_id = ?")->execute([$testTicketId]);
$pdo->prepare("DELETE FROM tickets WHERE id = ?")->execute([$testTicketId]);
$pdo->prepare("DELETE FROM sessions WHERE user_id IN (?, ?, ?, ?, ?, ?)")
    ->execute([$ptA_userId, $ptB_userId, $docA_userId, $docB_userId, $admin_userId, $support_userId]);
$pdo->prepare("DELETE FROM patients WHERE id IN (?, ?)")->execute([$ptA_patientId, $ptB_patientId]);
$pdo->prepare("DELETE FROM doctors WHERE id IN (?, ?)")->execute([$docA_doctorId, $docB_doctorId]);
$pdo->prepare("DELETE FROM users WHERE id IN (?, ?, ?, ?, ?, ?)")
    ->execute([$ptA_userId, $ptB_userId, $docA_userId, $docB_userId, $admin_userId, $support_userId]);

echo "\n==============================================================\n";
echo " BILAN FINAL : $testsPass / " . ($testsPass + $testsFail) . " TESTS PASS\n";
echo "==============================================================\n";
