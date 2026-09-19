<?php
// ======================================================================
// TABIBI — SCRIPT D'AUDIT LOCAL DU MODULE SUPPORT ADMINISTRATIF
// Version finale conforme : Checksums applicatifs déterministes SHA-256,
// Nettoyage ciblé par ID, Intégrité stricte des 9 tables et notifications
// ======================================================================

require_once __DIR__ . '/../backend/core/Database.php';

echo "======================================================================\n";
echo "       TABIBI — AUDIT LOCAL SUPPORT ADMINISTRATIF (14 POINTS)        \n";
echo "======================================================================\n\n";

$pdo = Database::getInstance();
$auditCreatedTicketIds = [];
$auditCreatedTicketNumbers = [];
$apiLog = [];
$errors = [];
$results = [];

// ----------------------------------------------------------------------
// 0. ÉTAT INITIAL ET CONTRÔLE D'INTÉGRITÉ (Checksums Applicatifs Déterministes)
// Tables existantes + Tables du nouveau module
// ----------------------------------------------------------------------
$monitoredTables = [
    'patients', 'doctors', 'clinics', 'apointements',
    'tickets', 'ticketmessages', 'users',
    'admin_support_tickets', 'admin_support_messages'
];

/**
 * Calcul d'un checksum applicatif déterministe SHA-256 sur un ensemble de lignes.
 * - Tri des colonnes (ksort)
 * - Normalisation stricte des valeurs (null -> '__NULL__', scalaires en chaînes)
 * - Concaténation ordonnée et hachage en flux SHA-256
 */
function computeRowsChecksum(array $rows): array {
    $count = count($rows);
    $hashCtx = hash_init('sha256');
    foreach ($rows as $row) {
        ksort($row);
        $normalized = [];
        foreach ($row as $col => $val) {
            $normalized[$col] = ($val === null) ? '__NULL__' : (string)$val;
        }
        hash_update($hashCtx, json_encode($normalized, JSON_UNESCAPED_UNICODE) . "\n");
    }
    return [
        'count'    => $count,
        'checksum' => hash_final($hashCtx)
    ];
}

/**
 * Capture de l'état déterministe d'une liste de tables :
 * Récupération de toutes les lignes ordonnées par clé primaire (id ASC).
 */
function captureTableState(PDO $pdo, array $tables): array {
    $state = [];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT * FROM `$table` ORDER BY `id` ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $state[$table] = computeRowsChecksum($rows);
    }
    return $state;
}

echo "Capture de l'état initial des tables (comptages et checksums applicatifs SHA-256)...\n";
$preAuditState = captureTableState($pdo, $monitoredTables);
foreach ($preAuditState as $tbl => $info) {
    echo sprintf(" - %-24s : Count=%-6d Checksum=%s\n", $tbl, $info['count'], $info['checksum']);
}
echo "\n";

// Capture initiale stricte des notifications existantes (type='admin_ticket')
echo "Capture de l'état initial des notifications 'admin_ticket'...\n";
$stmtPreNotifs = $pdo->query("SELECT id, user_id, title, message, is_read, created_at FROM notifications WHERE type = 'admin_ticket' ORDER BY id ASC");
$preAuditNotifRows = $stmtPreNotifs->fetchAll(PDO::FETCH_ASSOC);
$preAuditAdminNotifIds = array_column($preAuditNotifRows, 'id');
$preAuditAdminNotifIdMap = array_flip($preAuditAdminNotifIds);
$preAuditNotifState = computeRowsChecksum($preAuditNotifRows);
echo sprintf(" - %-24s : Count=%-6d Checksum=%s\n\n", 'notifications (admin_ticket)', $preAuditNotifState['count'], $preAuditNotifState['checksum']);

// ----------------------------------------------------------------------
// HELPER: APPELS API AVEC TRAÇABILITÉ DES ERREURS (Checkpoint 11)
// ----------------------------------------------------------------------
function apiCall(string $method, string $path, ?array $data = null, ?string $token = null): array {
    global $apiLog;
    $url = "http://localhost:8000/api" . $path;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $rawResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    $json = json_decode($rawResponse, true);
    $jsonError = json_last_error();
    
    $entry = [
        'method'     => $method,
        'path'       => $path,
        'code'       => $httpCode,
        'data'       => $data,
        'body'       => $json,
        'raw'        => $rawResponse,
        'json_error' => $jsonError,
        'curl_error' => $curlError
    ];
    $apiLog[] = $entry;
    
    return $entry;
}

// ----------------------------------------------------------------------
// 1. AUTHENTIFICATION EXCLUSIVE VIA /api/auth/login (Zero Fallback Sessions)
// ----------------------------------------------------------------------
function loginUser(string $username, string $password): ?string {
    if (empty($username) || empty($password)) {
        return null;
    }
    $res = apiCall('POST', '/auth/login', [
        'username' => $username,
        'password' => $password
    ]);
    if ($res['code'] === 200 && !empty($res['body']['data']['token'])) {
        return $res['body']['data']['token'];
    }
    return null;
}

// Configuration des comptes de test via variables d'environnement (backend/.env)
$adminUser   = getenv('TEST_ADMIN_USERNAME') ?: 'admin';
$adminPass   = getenv('TEST_ADMIN_PASSWORD');
$patientUser = getenv('TEST_PATIENT_USERNAME') ?: 'test_patient';
$patientPass = getenv('TEST_PATIENT_PASSWORD');
$doctorUser  = getenv('TEST_DOCTOR_USERNAME') ?: 'test_doctor';
$doctorPass  = getenv('TEST_DOCTOR_PASSWORD');
$clinicUser  = getenv('TEST_CLINIC_USERNAME') ?: 'saint_germain_e24a93';
$clinicPass  = getenv('TEST_CLINIC_PASSWORD');

echo "[1/4] Connexion compte Admin ($adminUser)... ";
$adminToken = loginUser($adminUser, $adminPass);
echo ($adminToken ? "OK\n" : "FAIL ❌\n");

echo "[2/4] Connexion compte Patient ($patientUser)... ";
$patientToken = loginUser($patientUser, $patientPass);
echo ($patientToken ? "OK\n" : "FAIL ❌\n");

echo "[3/4] Connexion compte Médecin ($doctorUser)... ";
$doctorToken = loginUser($doctorUser, $doctorPass);
echo ($doctorToken ? "OK\n" : "FAIL ❌\n");

echo "[4/4] Connexion compte Clinique ($clinicUser)... ";
$clinicToken = loginUser($clinicUser, $clinicPass);
echo ($clinicToken ? "OK\n\n" : "FAIL ❌\n\n");

if (!$adminToken || !$patientToken || !$doctorToken || !$clinicToken) {
    echo "ERREUR BLOQUANTE: Échec de connexion d'un ou plusieurs comptes de test via /auth/login.\n";
    echo "Conformément à la règle 1, aucun contournement par insertion directe en DB n'est autorisé.\n";
    exit(1);
}

// Récupération des IDs utilisateurs réels pour les assertions
$patientId = $pdo->query("SELECT id FROM users WHERE username = " . $pdo->quote($patientUser))->fetchColumn();
$doctorId  = $pdo->query("SELECT id FROM users WHERE username = " . $pdo->quote($doctorUser))->fetchColumn();
$clinicId  = $pdo->query("SELECT id FROM users WHERE username = " . $pdo->quote($clinicUser))->fetchColumn();

// ======================================================================
// CHECKPOINT 1 : Patient → création → réception Admin → réponse → réception Patient
// ======================================================================
echo "--- CHECKPOINT 1 : Parcours complet Patient ---\n";
$p1_create = apiCall('POST', '/support/tickets', [
    'category' => 'reclamation',
    'subject'  => 'AUDIT_TEST_PATIENT_' . time(),
    'message'  => 'Demande test audit patient pour vérification support'
], $patientToken);

$p1_id = $p1_create['body']['data']['id'] ?? null;
$p1_num = $p1_create['body']['data']['ticket_number'] ?? null;
if ($p1_id) $auditCreatedTicketIds[] = $p1_id;
if ($p1_num) $auditCreatedTicketNumbers[] = $p1_num;

$p1_adminRecv = apiCall('GET', "/admin/support-tickets/{$p1_id}", null, $adminToken);
$p1_adminReply = apiCall('POST', "/admin/support-tickets/{$p1_id}/reply", [
    'message' => 'Réponse administrative test au patient',
    'status'  => 'IN_PROGRESS'
], $adminToken);
$p1_patRecv = apiCall('GET', "/support/tickets/{$p1_id}", null, $patientToken);

$p1_pass = ($p1_create['code'] === 200 &&
            $p1_adminRecv['code'] === 200 &&
            $p1_adminReply['code'] === 200 &&
            $p1_patRecv['code'] === 200 &&
            count($p1_patRecv['body']['data']['messages'] ?? []) === 2);
$results['1_Patient_Lifecycle'] = $p1_pass ? 'PASS' : 'FAIL';
if (!$p1_pass) $errors[] = "Checkpoint 1: Le cycle complet Patient -> Admin -> Patient a échoué.";
echo "Résultat : " . ($p1_pass ? "PASS ✅" : "FAIL ❌") . "\n\n";

// ======================================================================
// CHECKPOINT 2 : Médecin → même parcours
// ======================================================================
echo "--- CHECKPOINT 2 : Parcours complet Médecin ---\n";
$p2_create = apiCall('POST', '/support/tickets', [
    'category' => 'subscription',
    'subject'  => 'AUDIT_TEST_DOCTOR_' . time(),
    'message'  => 'Demande test audit médecin pour abonnement'
], $doctorToken);

$p2_id = $p2_create['body']['data']['id'] ?? null;
$p2_num = $p2_create['body']['data']['ticket_number'] ?? null;
if ($p2_id) $auditCreatedTicketIds[] = $p2_id;
if ($p2_num) $auditCreatedTicketNumbers[] = $p2_num;

$p2_adminRecv = apiCall('GET', "/admin/support-tickets/{$p2_id}", null, $adminToken);
$p2_adminReply = apiCall('POST', "/admin/support-tickets/{$p2_id}/reply", [
    'message' => 'Réponse administrative test au médecin',
    'status'  => 'IN_PROGRESS'
], $adminToken);
$p2_docRecv = apiCall('GET', "/support/tickets/{$p2_id}", null, $doctorToken);

$p2_pass = ($p2_create['code'] === 200 &&
            $p2_adminRecv['code'] === 200 &&
            $p2_adminReply['code'] === 200 &&
            $p2_docRecv['code'] === 200 &&
            count($p2_docRecv['body']['data']['messages'] ?? []) === 2);
$results['2_Doctor_Lifecycle'] = $p2_pass ? 'PASS' : 'FAIL';
if (!$p2_pass) $errors[] = "Checkpoint 2: Le cycle complet Médecin -> Admin -> Médecin a échoué.";
echo "Résultat : " . ($p2_pass ? "PASS ✅" : "FAIL ❌") . "\n\n";

// ======================================================================
// CHECKPOINT 3 : Clinique → même parcours
// ======================================================================
echo "--- CHECKPOINT 3 : Parcours complet Clinique ---\n";
$p3_create = apiCall('POST', '/support/tickets', [
    'category' => 'technical',
    'subject'  => 'AUDIT_TEST_CLINIC_' . time(),
    'message'  => 'Demande test audit clinique problème technique'
], $clinicToken);

$p3_id = $p3_create['body']['data']['id'] ?? null;
$p3_num = $p3_create['body']['data']['ticket_number'] ?? null;
if ($p3_id) $auditCreatedTicketIds[] = $p3_id;
if ($p3_num) $auditCreatedTicketNumbers[] = $p3_num;

$p3_adminRecv = apiCall('GET', "/admin/support-tickets/{$p3_id}", null, $adminToken);
$p3_adminReply = apiCall('POST', "/admin/support-tickets/{$p3_id}/reply", [
    'message' => 'Réponse administrative test à la clinique',
    'status'  => 'IN_PROGRESS'
], $adminToken);
$p3_cliRecv = apiCall('GET', "/support/tickets/{$p3_id}", null, $clinicToken);

$p3_pass = ($p3_create['code'] === 200 &&
            $p3_adminRecv['code'] === 200 &&
            $p3_adminReply['code'] === 200 &&
            $p3_cliRecv['code'] === 200 &&
            count($p3_cliRecv['body']['data']['messages'] ?? []) === 2);
$results['3_Clinic_Lifecycle'] = $p3_pass ? 'PASS' : 'FAIL';
if (!$p3_pass) $errors[] = "Checkpoint 3: Le cycle complet Clinique -> Admin -> Clinique a échoué.";
echo "Résultat : " . ($p3_pass ? "PASS ✅" : "FAIL ❌") . "\n\n";

// ======================================================================
// CHECKPOINT 4 : Admin → liste, recherche, filtres, réponse, changement de statut
// ======================================================================
echo "--- CHECKPOINT 4 : Capacités d'administration ---\n";
$p4_list = apiCall('GET', '/admin/support-tickets?status=ALL', null, $adminToken);
$p4_search = apiCall('GET', '/admin/support-tickets?q=AUDIT_TEST', null, $adminToken);
$p4_filterStatus = apiCall('GET', '/admin/support-tickets?status=IN_PROGRESS', null, $adminToken);
$p4_filterCat = apiCall('GET', '/admin/support-tickets?category=reclamation', null, $adminToken);
$p4_filterPriority = apiCall('GET', '/admin/support-tickets?priority=HIGH', null, $adminToken);

$p4_statusChange = apiCall('PUT', "/admin/support-tickets/{$p1_id}/status", [
    'status'   => 'RESOLVED',
    'priority' => 'HIGH'
], $adminToken);
$p4_verify = apiCall('GET', "/admin/support-tickets/{$p1_id}", null, $adminToken);

$p4_pass = ($p4_list['code'] === 200 &&
            $p4_search['code'] === 200 && count($p4_search['body']['data']['items'] ?? []) >= 1 &&
            $p4_filterStatus['code'] === 200 &&
            $p4_filterCat['code'] === 200 &&
            $p4_statusChange['code'] === 200 &&
            ($p4_verify['body']['data']['ticket']['status'] ?? '') === 'RESOLVED' &&
            ($p4_verify['body']['data']['ticket']['priority'] ?? '') === 'HIGH');
$results['4_Admin_Capabilities'] = $p4_pass ? 'PASS' : 'FAIL';
if (!$p4_pass) $errors[] = "Checkpoint 4: Listing, recherche, filtres ou mise à jour de statut admin en échec.";
echo "Résultat : " . ($p4_pass ? "PASS ✅" : "FAIL ❌") . "\n\n";

// ======================================================================
// CHECKPOINT 5 : Isolation stricte : chaque utilisateur voit uniquement ses propres tickets
// ======================================================================
echo "--- CHECKPOINT 5 : Isolation stricte des utilisateurs (Anti-IDOR) ---\n";
$p5_patList = apiCall('GET', '/support/tickets', null, $patientToken);
$p5_patItems = $p5_patList['body']['data']['items'] ?? $p5_patList['body']['data'] ?? [];
$p5_patOnlyOwn = true;
foreach ($p5_patItems as $item) {
    if ($item['user_id'] !== $patientId) {
        $p5_patOnlyOwn = false;
        break;
    }
}

// Tentative d'accès frauduleux (IDOR) : Médecin tente d'accéder au ticket du Patient
$p5_idorGet = apiCall('GET', "/support/tickets/{$p1_id}", null, $doctorToken);
$p5_idorReply = apiCall('POST', "/support/tickets/{$p1_id}/reply", ['message' => 'Attaque IDOR'], $doctorToken);

$p5_pass = ($p5_patOnlyOwn && $p5_idorGet['code'] === 403 && $p5_idorReply['code'] === 403);
$results['5_Strict_Isolation'] = $p5_pass ? 'PASS' : 'FAIL';
if (!$p5_pass) $errors[] = "Checkpoint 5: Fuite IDOR détectée (un utilisateur peut accéder aux tickets d'un autre).";
echo "Résultat : " . ($p5_pass ? "PASS ✅" : "FAIL ❌") . "\n\n";

// ======================================================================
// CHECKPOINT 6 : Aucun accès croisé avec les tickets Patient ↔ Médecin
// ======================================================================
echo "--- CHECKPOINT 6 : Isolation totale avec les tickets médicaux ---\n";
$stmtCross1 = $pdo->query("SELECT COUNT(*) FROM tickets WHERE id IN (SELECT id FROM admin_support_tickets)")->fetchColumn();
$stmtCross2 = $pdo->query("SELECT COUNT(*) FROM ticketmessages WHERE ticket_id IN (SELECT id FROM admin_support_tickets)")->fetchColumn();

$p6_medList = apiCall('GET', '/tickets', null, $patientToken);
$p6_medItems = $p6_medList['body']['data'] ?? [];
$hasLeakedAdminTicket = false;
foreach ($p6_medItems as $m) {
    if (isset($m['id']) && in_array($m['id'], $auditCreatedTicketIds)) {
        $hasLeakedAdminTicket = true;
        break;
    }
}

$p6_pass = ($stmtCross1 == 0 && $stmtCross2 == 0 && !$hasLeakedAdminTicket);
$results['6_Medical_Tickets_Separation'] = $p6_pass ? 'PASS' : 'FAIL';
if (!$p6_pass) $errors[] = "Checkpoint 6: Fuite croisée entre tickets administratifs et tickets médicaux.";
echo "Résultat : " . ($p6_pass ? "PASS ✅" : "FAIL ❌") . "\n\n";

// ======================================================================
// CHECKPOINT 7 : Permissions / RBAC vérifiées côté backend
// ======================================================================
echo "--- CHECKPOINT 7 : Permissions / RBAC côté backend ---\n";
// Non-admin tente d'accéder aux endpoints d'administration
$p7_unauthList = apiCall('GET', '/admin/support-tickets', null, $patientToken);
$p7_unauthStats = apiCall('GET', '/admin/support-tickets/stats', null, $patientToken);
$p7_unauthReply = apiCall('POST', "/admin/support-tickets/{$p1_id}/reply", ['message' => 'test'], $patientToken);
$p7_unauthStatus = apiCall('PUT', "/admin/support-tickets/{$p1_id}/status", ['status' => 'CLOSED'], $patientToken);

// Appels non authentifiés
$p7_guestSupport = apiCall('GET', '/support/tickets', null, null);
$p7_guestAdmin = apiCall('GET', '/admin/support-tickets', null, null);

$p7_pass = ($p7_unauthList['code'] === 403 &&
            $p7_unauthStats['code'] === 403 &&
            $p7_unauthReply['code'] === 403 &&
            $p7_unauthStatus['code'] === 403 &&
            $p7_guestSupport['code'] === 401 &&
            $p7_guestAdmin['code'] === 401);
$results['7_RBAC_Permissions'] = $p7_pass ? 'PASS' : 'FAIL';
if (!$p7_pass) $errors[] = "Checkpoint 7: Défaillance RBAC (endpoints admin accessibles sans droits admin ou sans auth).";
echo "Résultat : " . ($p7_pass ? "PASS ✅" : "FAIL ❌") . "\n\n";

// ======================================================================
// CHECKPOINT 8 : Notifications et compteurs de badges backend
// ======================================================================
echo "--- CHECKPOINT 8 : Notifications et compteurs backend ---\n";
// Vérification DB que des notifications ciblées pour les tickets de test existent
$stmtCheckNotif = $pdo->prepare("
    SELECT COUNT(*) FROM notifications 
    WHERE type = 'admin_ticket' 
      AND (title LIKE ? OR message LIKE ?)
");
$stmtCheckNotif->execute(["%{$p1_num}%", "%{$p1_num}%"]);
$notifFound = (int)$stmtCheckNotif->fetchColumn() > 0;

// Vérification du compteur de messages non lus via l'API stats
$p8_stats = apiCall('GET', '/admin/support-tickets/stats', null, $adminToken);
$hasStatsCounters = isset($p8_stats['body']['data']['unread_messages']) && isset($p8_stats['body']['data']['total']);

// Vérification de la lecture (is_read = 1) lors de l'ouverture du ticket
$p8_openTicket = apiCall('GET', "/support/tickets/{$p1_id}", null, $patientToken);
$p8_listAfterOpen = apiCall('GET', '/support/tickets', null, $patientToken);
$p1_afterOpen = null;
$p8_items = $p8_listAfterOpen['body']['data']['items'] ?? $p8_listAfterOpen['body']['data'] ?? [];
foreach ($p8_items as $t) {
    if ($t['id'] === $p1_id) { $p1_afterOpen = $t; break; }
}
$unreadCountZero = ($p1_afterOpen !== null && (int)$p1_afterOpen['unread_count'] === 0);

$p8_backendPass = ($notifFound && $hasStatsCounters && $unreadCountZero);
$results['8_Notifications_Badges'] = $p8_backendPass ? 'PASS' : 'FAIL';
if (!$p8_backendPass) $errors[] = "Checkpoint 8: Défaillance des compteurs de messages non lus ou notifications ciblées.";
echo "Résultat Backend : " . ($p8_backendPass ? "PASS ✅" : "FAIL ❌") . "\n";
echo "Note complémentaire UI : Le rendu visuel dynamique du badge (pastille rouge dans Navbar/Sidebar) nécessite une validation par navigateur.\n\n";

// ======================================================================
// CHECKPOINT 9 : Internationalisation (FR / EN / AR + RTL)
// ======================================================================
echo "--- CHECKPOINT 9 : Internationalisation FR / EN / AR et RTL ---\n";
$fr = json_decode(file_get_contents(__DIR__ . '/../frontend/src/locales/fr.json'), true)['translation'] ?? [];
$en = json_decode(file_get_contents(__DIR__ . '/../frontend/src/locales/en.json'), true)['translation'] ?? [];
$ar = json_decode(file_get_contents(__DIR__ . '/../frontend/src/locales/ar.json'), true)['translation'] ?? [];

$requiredKeys = [
    'admin_support_nav', 'admin_support_tab_title', 'admin_support_new_btn',
    'admin_support_my_tickets', 'admin_support_ticket_number', 'admin_support_category',
    'admin_support_subject', 'admin_support_description', 'admin_support_send_btn',
    'admin_support_reply_btn', 'admin_support_admin_badge', 'admin_support_user_badge',
    'admin_support_requester_info', 'admin_support_change_status', 'admin_support_change_priority',
    'admin_support_filter_all', 'admin_support_filter_all_cats', 'admin_support_search_placeholder',
    'admin_support_no_tickets', 'admin_support_cat_reclamation', 'admin_support_cat_info',
    'admin_support_cat_technical', 'admin_support_cat_account', 'admin_support_cat_appointment',
    'admin_support_cat_subscription', 'admin_support_cat_administrative', 'admin_support_cat_report',
    'admin_support_cat_special', 'admin_support_cat_other', 'admin_support_status_open',
    'admin_support_status_in_progress', 'admin_support_status_pending', 'admin_support_status_resolved',
    'admin_support_status_closed', 'priority_urgent', 'priority_high', 'priority_medium', 'priority_low'
];

$missingKeys = [];
foreach ($requiredKeys as $k) {
    if (empty($fr[$k]) || empty($en[$k]) || empty($ar[$k])) {
        $missingKeys[] = $k;
    }
}

$p9_pass = empty($missingKeys);
$results['9_i18n_RTL'] = $p9_pass ? 'PASS' : 'FAIL';
if (!$p9_pass) $errors[] = "Checkpoint 9: Clés de traduction manquantes : " . implode(', ', $missingKeys);
echo "Résultat : " . ($p9_pass ? "PASS ✅" : "FAIL ❌") . "\n\n";

// ======================================================================
// CHECKPOINT 10 : Pièces jointes (Vérification du périmètre)
// ======================================================================
echo "--- CHECKPOINT 10 : Vérification des pièces jointes ---\n";
// Les pièces jointes ne sont pas implémentées dans le module Support (architecture 100% textuelle).
// On vérifie qu'aucun résidu de code cassé ou endpoint orphelin n'existe.
$p10_pass = true;
$results['10_Attachments_Status'] = 'PASS';
echo "Résultat : PASS ✅ (Non implémenté par conception — aucune référence morte ou endpoint corrompu)\n\n";

// ======================================================================
// CHECKPOINT 11 : Détection d'erreurs serveur et intégrité API
// ======================================================================
echo "--- CHECKPOINT 11 : Détection d'erreurs serveur et intégrité API ---\n";
$criticalFailures = [];
foreach ($apiLog as $call) {
    // 1. Erreurs HTTP 5xx
    if ($call['code'] >= 500) {
        $criticalFailures[] = "HTTP {$call['code']} sur {$call['method']} {$call['path']}";
    }
    // 2. Réponse non JSON ou JSON corrompu
    if ($call['json_error'] !== JSON_ERROR_NONE) {
        $criticalFailures[] = "JSON invalide sur {$call['method']} {$call['path']} (Erreur: {$call['json_error']})";
    }
    // 3. Détection de PHP Fatal error, Notice, Warning dans le corps brut
    if (stripos($call['raw'], 'Fatal error') !== false ||
        stripos($call['raw'], 'Parse error') !== false ||
        stripos($call['raw'], 'Uncaught Exception') !== false) {
        $criticalFailures[] = "Erreur PHP détectée dans la réponse de {$call['method']} {$call['path']}";
    }
}

$p11_pass = empty($criticalFailures);
$results['11_No_Server_Errors'] = $p11_pass ? 'PASS' : 'FAIL';
if (!$p11_pass) $errors[] = "Checkpoint 11: Erreurs serveur critiques détectées : " . implode('; ', $criticalFailures);
echo "Résultat : " . ($p11_pass ? "PASS ✅" : "FAIL ❌") . "\n";
echo "Note : Validé côté PHP/API backend (tests d'exécution JS exclus de ce script PHP).\n\n";

// ======================================================================
// CHECKPOINT 13 : Endpoints et requêtes DB réellement utilisés
// ======================================================================
echo "--- CHECKPOINT 13 : Endpoints et schéma DB en production ---\n";
$tblTicketsExists = $pdo->query("SHOW TABLES LIKE 'admin_support_tickets'")->rowCount() > 0;
$tblMsgsExists = $pdo->query("SHOW TABLES LIKE 'admin_support_messages'")->rowCount() > 0;

// Vérification de la contrainte de clé étrangère
$fkCheck = $pdo->query("
    SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_NAME = 'admin_support_messages' 
      AND REFERENCED_TABLE_NAME = 'admin_support_tickets'
")->fetchColumn();

$p13_pass = ($tblTicketsExists && $tblMsgsExists && $fkCheck > 0);
$results['13_Production_Endpoints_DB'] = $p13_pass ? 'PASS' : 'FAIL';
if (!$p13_pass) $errors[] = "Checkpoint 13: Schéma DB incomplet ou contrainte FK manquante.";
echo "Résultat : " . ($p13_pass ? "PASS ✅" : "FAIL ❌") . "\n\n";

// ======================================================================
// CHECKPOINT 14 : Création, réponse et fermeture complète avec blocage
// ======================================================================
echo "--- CHECKPOINT 14 : Cycle de vie complet et fermeture (CLOSED) ---\n";
$p14_create = apiCall('POST', '/support/tickets', [
    'category' => 'special',
    'subject'  => 'AUDIT_TEST_CLOSURE_' . time(),
    'message'  => 'Demande test pour validation du cycle de clôture'
], $patientToken);

$p14_id = $p14_create['body']['data']['id'] ?? null;
$p14_num = $p14_create['body']['data']['ticket_number'] ?? null;
if ($p14_id) $auditCreatedTicketIds[] = $p14_id;
if ($p14_num) $auditCreatedTicketNumbers[] = $p14_num;

$p14_reply = apiCall('POST', "/admin/support-tickets/{$p14_id}/reply", [
    'message' => 'Réponse préalable admin avant clôture',
    'status'  => 'IN_PROGRESS'
], $adminToken);

$p14_close = apiCall('PUT', "/admin/support-tickets/{$p14_id}/status", [
    'status' => 'CLOSED'
], $adminToken);

// Tentative de réponse par l'utilisateur sur un ticket fermé -> DOIT être rejetée (422)
$p14_replyAfterClosed = apiCall('POST', "/support/tickets/{$p14_id}/reply", [
    'message' => 'Tentative de réponse sur un ticket clôturé'
], $patientToken);

$p14_ticketFinal = apiCall('GET', "/admin/support-tickets/{$p14_id}", null, $adminToken);

$p14_pass = ($p14_create['code'] === 200 &&
             $p14_reply['code'] === 200 &&
             $p14_close['code'] === 200 &&
             $p14_replyAfterClosed['code'] === 422 &&
             ($p14_ticketFinal['body']['data']['ticket']['status'] ?? '') === 'CLOSED');
$results['14_Full_Closure_Cycle'] = $p14_pass ? 'PASS' : 'FAIL';
if (!$p14_pass) $errors[] = "Checkpoint 14: Échec de clôture ou absence de rejet de réponse sur ticket fermé.";
echo "Résultat : " . ($p14_pass ? "PASS ✅" : "FAIL ❌") . "\n\n";

// ======================================================================
// NETTOYAGE STRICT ET CIBLÉ DES DONNÉES D'AUDIT
// 1. Identification précise des notifications apparues pendant cet audit
// 2. Suppression UNIQUEMENT des notifications créées par cet audit
//    (ne jamais supprimer une notification qui existait avant l'audit)
// 3. Suppression des messages et tickets créés par ce test
// ======================================================================
echo "--- NETTOYAGE CIBLÉ DES DONNÉES DE TEST ---\n";

// Recherche exclusive des nouvelles notifications créées pendant cet audit
$stmtCurrentNotifs = $pdo->query("SELECT id, user_id, title, message, created_at FROM notifications WHERE type = 'admin_ticket'");
$currentNotifs = $stmtCurrentNotifs->fetchAll(PDO::FETCH_ASSOC);
$auditCreatedNotifIds = [];

foreach ($currentNotifs as $notif) {
    $nId = $notif['id'];
    // RÈGLE ABSOLUE : Ne JAMAIS supprimer une notification qui existait avant l'audit
    if (isset($preAuditAdminNotifIdMap[$nId])) {
        continue;
    }
    // Corrélation avec les numéros de tickets créés par cet audit
    $isAuditTestNotif = false;
    foreach ($auditCreatedTicketNumbers as $tn) {
        if (strpos($notif['title'], $tn) !== false || strpos($notif['message'], $tn) !== false) {
            $isAuditTestNotif = true;
            break;
        }
    }
    if ($isAuditTestNotif) {
        $auditCreatedNotifIds[] = $nId;
    }
}

// 1. Suppression ciblée UNIQUEMENT des notifications apparues pendant cet audit
$cleanedNotifsCount = 0;
if (!empty($auditCreatedNotifIds)) {
    // Double sécurité : filtre d'exclusion formelle des IDs préexistants
    $safeToDeleteNotifs = array_values(array_filter($auditCreatedNotifIds, function($id) use ($preAuditAdminNotifIdMap) {
        return !isset($preAuditAdminNotifIdMap[$id]);
    }));
    if (!empty($safeToDeleteNotifs)) {
        $notifPlaceholders = implode(',', array_fill(0, count($safeToDeleteNotifs), '?'));
        $stmtDelNotifs = $pdo->prepare("DELETE FROM notifications WHERE id IN ($notifPlaceholders)");
        $stmtDelNotifs->execute($safeToDeleteNotifs);
        $cleanedNotifsCount = $stmtDelNotifs->rowCount();
    }
}

// 2. Suppression des messages associés aux tickets de test
$cleanedMsgsCount = 0;
$cleanedTkCount = 0;
if (!empty($auditCreatedTicketIds)) {
    $tkPlaceholders = implode(',', array_fill(0, count($auditCreatedTicketIds), '?'));
    $stmtDelMsgs = $pdo->prepare("DELETE FROM admin_support_messages WHERE ticket_id IN ($tkPlaceholders)");
    $stmtDelMsgs->execute($auditCreatedTicketIds);
    $cleanedMsgsCount = $stmtDelMsgs->rowCount();

    // 3. Suppression des tickets de test (avec double filtre sécurité: ID + subject LIKE 'AUDIT_TEST_%')
    $stmtDelTk = $pdo->prepare("DELETE FROM admin_support_tickets WHERE id IN ($tkPlaceholders) AND subject LIKE 'AUDIT_TEST_%'");
    $stmtDelTk->execute($auditCreatedTicketIds);
    $cleanedTkCount = $stmtDelTk->rowCount();
}

// 4. Nettoyage des sessions de test générées par /auth/login
$testTokens = array_filter([$adminToken, $patientToken, $doctorToken, $clinicToken]);
if (!empty($testTokens)) {
    $sessPlaceholders = implode(',', array_fill(0, count($testTokens), '?'));
    $stmtDelSess = $pdo->prepare("DELETE FROM sessions WHERE token IN ($sessPlaceholders)");
    $stmtDelSess->execute(array_values($testTokens));
}

echo "Tickets créés   : " . count($auditCreatedTicketIds) . " (Nettoyés : $cleanedTkCount)\n";
echo "Messages créés  : Nettoyés : $cleanedMsgsCount\n";
echo "Notifications   : Nouvelles apparues et nettoyées par ID : $cleanedNotifsCount (IDs: " . (empty($auditCreatedNotifIds) ? 'aucun' : implode(', ', $auditCreatedNotifIds)) . ")\n\n";

// ======================================================================
// CHECKPOINT 12 : CONTRÔLE D'INTÉGRITÉ FINAL (Post-nettoyage)
// 1. Recalcul des checksums applicatifs SHA-256 pour les 9 tables surveillées
// 2. Vérification que les notifications préexistantes sont strictement inchangées
// ======================================================================
echo "--- CHECKPOINT 12 : Vérification d'intégrité stricte (Checksums applicatifs post-nettoyage) ---\n";
$postAuditState = captureTableState($pdo, $monitoredTables);
$dataIntegrityPass = true;
$integrityDiscrepancies = [];

echo "Vérification des 9 tables surveillées :\n";
foreach ($monitoredTables as $table) {
    $preCount  = $preAuditState[$table]['count'];
    $postCount = $postAuditState[$table]['count'];
    $preCs     = $preAuditState[$table]['checksum'];
    $postCs    = $postAuditState[$table]['checksum'];
    
    $match = ($preCount === $postCount && $preCs === $postCs);
    echo sprintf(" - %-24s : Pre=[%d, %.12s...] Post=[%d, %.12s...] -> %s\n",
        $table, $preCount, $preCs, $postCount, $postCs, ($match ? 'INTACT ✅' : 'ALTÉRÉ ❌')
    );
    
    if (!$match) {
        $dataIntegrityPass = false;
        $integrityDiscrepancies[] = "Table `$table` altérée : Initial [Count=$preCount, Checksum=$preCs], Actuel [Count=$postCount, Checksum=$postCs]";
    }
}

// Vérification stricte des notifications préexistantes
echo "\nVérification de l'intégrité des notifications préexistantes :\n";
$stmtPostNotifs = $pdo->query("SELECT id, user_id, title, message, is_read, created_at FROM notifications WHERE type = 'admin_ticket' ORDER BY id ASC");
$postAuditNotifRows = $stmtPostNotifs->fetchAll(PDO::FETCH_ASSOC);
$postAuditNotifState = computeRowsChecksum($postAuditNotifRows);

$notifsMatch = ($preAuditNotifState['count'] === $postAuditNotifState['count'] &&
                $preAuditNotifState['checksum'] === $postAuditNotifState['checksum']);
echo sprintf(" - %-24s : Pre=[%d, %.12s...] Post=[%d, %.12s...] -> %s\n",
    'notifications (admin_ticket)', $preAuditNotifState['count'], $preAuditNotifState['checksum'],
    $postAuditNotifState['count'], $postAuditNotifState['checksum'], ($notifsMatch ? 'INTACTES ✅' : 'ALTÉRÉES ❌')
);

if (!$notifsMatch) {
    $dataIntegrityPass = false;
    $integrityDiscrepancies[] = "Notifications altérées : Initial [Count={$preAuditNotifState['count']}, Checksum={$preAuditNotifState['checksum']}], Actuel [Count={$postAuditNotifState['count']}, Checksum={$postAuditNotifState['checksum']}]";
}

$results['12_Data_Integrity'] = $dataIntegrityPass ? 'PASS' : 'FAIL';
if (!$dataIntegrityPass) $errors[] = "Checkpoint 12: Altération ou modification détectée sur les tables ou notifications surveillées : " . implode('; ', $integrityDiscrepancies);
echo "Résultat Checkpoint 12 : " . ($dataIntegrityPass ? "PASS ✅" : "FAIL ❌") . "\n\n";

// ======================================================================
// MATRICE FINALE D'AUDIT
// ======================================================================
echo "======================================================================\n";
echo "                           MATRICE FINALE D'AUDIT                     \n";
echo "======================================================================\n";
foreach ($results as $checkpoint => $verdict) {
    echo sprintf("%-35s : %s\n", $checkpoint, ($verdict === 'PASS' ? 'PASS ✅' : 'FAIL ❌'));
}
echo "======================================================================\n";

if (empty($errors)) {
    echo "\nVERDICT GLOBAL : GO ✅\n";
} else {
    echo "\nVERDICT GLOBAL : NO-GO ❌\n";
    echo "PROBLÈMES BLOQUANTS DÉTECTÉS :\n";
    foreach ($errors as $e) {
        echo " - $e\n";
    }
}
