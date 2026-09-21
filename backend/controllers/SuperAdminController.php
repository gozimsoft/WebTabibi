<?php
// ============================================================
// controllers/SuperAdminController.php
// Contrôleur de gestion centralisée des comptes (SuperAdmin ONLY)
// ============================================================
declare(strict_types=1);

require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/PasswordHelper.php';
require_once __DIR__ . '/../helpers/EmailHelper.php';
require_once __DIR__ . '/../helpers/UserValidationHelper.php';

class SuperAdminController {

    /**
     * GET /api/superadmin/accounts
     * Liste paginée de tous les comptes avec recherche et filtres.
     */
    public static function listAccounts(): void {
        AuthMiddleware::superAdminOnly();
        $pdo = Database::getInstance();

        $q         = trim((string)($_GET['q'] ?? ''));
        $role      = isset($_GET['role']) && $_GET['role'] !== '' && $_GET['role'] !== 'all' ? (int)$_GET['role'] : null;
        $status    = trim((string)($_GET['status'] ?? 'all'));
        $period    = trim((string)($_GET['period'] ?? ''));
        $dateFrom  = trim((string)($_GET['date_from'] ?? ''));
        $dateTo    = trim((string)($_GET['date_to'] ?? ''));
        $page      = max(1, (int)($_GET['page'] ?? 1));
        $limit     = min(100, max(5, (int)($_GET['limit'] ?? 20)));
        $offset    = ($page - 1) * $limit;

        // Conversion du filtre period en dateFrom si applicable
        if ($period !== '' && $period !== 'all') {
            if ($period === 'today') {
                $dateFrom = date('Y-m-d');
            } elseif ($period === 'week') {
                $dateFrom = date('Y-m-d', strtotime('-7 days'));
            } elseif ($period === 'month') {
                $dateFrom = date('Y-m-d', strtotime('-30 days'));
            } elseif ($period === 'year') {
                $dateFrom = date('Y-01-01');
            }
        }

        $where = ["1=1"];
        $params = [];

        // Recherche multi-critères
        if ($q !== '') {
            $like = '%' . $q . '%';
            $where[] = "(
                u.username LIKE ? OR 
                p.fullname LIKE ? OR 
                d.fullname LIKE ? OR 
                c.clinicname LIKE ? OR 
                p.email LIKE ? OR 
                d.email LIKE ? OR 
                c.email LIKE ? OR 
                p.phone LIKE ? OR 
                d.phone LIKE ? OR 
                c.phone LIKE ? OR 
                p.nin LIKE ? OR 
                d.nin LIKE ?
            )";
            for ($i = 0; $i < 12; $i++) {
                $params[] = $like;
            }
        }

        // Filtre par rôle
        if ($role !== null) {
            $where[] = "u.usertype = ?";
            $params[] = $role;
        }

        // Filtre par statut
        if ($status === 'active') {
            $where[] = "(
                (u.usertype = 0 AND (p.deleteacount IS NULL OR p.deleteacount = 0) AND (p.is_frozen IS NULL OR p.is_frozen = 0)) OR
                (u.usertype = 1 AND d.status = 'APPROVED' AND (d.is_frozen IS NULL OR d.is_frozen = 0)) OR
                (u.usertype = 2 AND c.status = 'APPROVED' AND (c.is_frozen IS NULL OR c.is_frozen = 0)) OR
                (u.usertype IN (3, 4))
            )";
        } elseif ($status === 'frozen') {
            $where[] = "(
                (u.usertype = 0 AND p.is_frozen = 1) OR
                (u.usertype = 1 AND d.is_frozen = 1) OR
                (u.usertype = 2 AND c.is_frozen = 1)
            )";
        } elseif ($status === 'pending') {
            $where[] = "(
                (u.usertype = 1 AND d.status = 'PENDING') OR
                (u.usertype = 2 AND c.status = 'PENDING')
            )";
        } elseif ($status === 'deleted' || $status === 'anonymized') {
            $where[] = "(u.usertype = 0 AND p.deleteacount = 1)";
        } elseif ($status === 'inactive') {
            $where[] = "(
                (u.usertype = 0 AND (p.is_frozen = 1 OR p.deleteacount = 1)) OR
                (u.usertype = 1 AND (d.status != 'APPROVED' OR d.is_frozen = 1)) OR
                (u.usertype = 2 AND (c.status != 'APPROVED' OR c.is_frozen = 1))
            )";
        }

        // Filtre par date
        if ($dateFrom !== '') {
            $where[] = "COALESCE(p.consent_at, d.approvedat, c.approvedat, '2026-01-01') >= ?";
            $params[] = $dateFrom . ' 00:00:00';
        }
        if ($dateTo !== '') {
            $where[] = "COALESCE(p.consent_at, d.approvedat, c.approvedat, '2026-01-01') <= ?";
            $params[] = $dateTo . ' 23:59:59';
        }

        $whereSql = implode(' AND ', $where);

        // Compte total
        $countStmt = $pdo->prepare("
            SELECT COUNT(u.id) 
            FROM users u
            LEFT JOIN patients p ON p.user_id = u.id
            LEFT JOIN doctors d ON d.user_id = u.id
            LEFT JOIN clinics c ON c.user_id = u.id
            WHERE {$whereSql}
        ");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        // Récupération des résultats paginés
        $queryStmt = $pdo->prepare("
            SELECT 
                u.id, 
                u.username, 
                u.usertype,
                COALESCE(p.fullname, d.fullname, c.clinicname, u.username) AS name,
                COALESCE(p.email, d.email, c.email, '') AS email,
                COALESCE(p.phone, d.phone, c.phone, '') AS phone,
                p.nin AS patient_nin,
                d.nin AS doctor_nin,
                p.deleteacount AS patient_deleted,
                p.is_frozen AS patient_frozen,
                p.freeze_reason AS patient_freeze_reason,
                p.frozen_at AS patient_frozen_at,
                d.status AS doctor_status,
                d.is_frozen AS doctor_frozen,
                d.freeze_reason AS doctor_freeze_reason,
                d.frozen_at AS doctor_frozen_at,
                c.status AS clinic_status,
                c.is_frozen AS clinic_frozen,
                c.freeze_reason AS clinic_freeze_reason,
                c.frozen_at AS clinic_frozen_at,
                p.consent_at AS patient_created,
                d.approvedat AS doctor_approved,
                c.approvedat AS clinic_approved
            FROM users u
            LEFT JOIN patients p ON p.user_id = u.id
            LEFT JOIN doctors d ON d.user_id = u.id
            LEFT JOIN clinics c ON c.user_id = u.id
            WHERE {$whereSql}
            ORDER BY u.id DESC
            LIMIT {$limit} OFFSET {$offset}
        ");
        $queryStmt->execute($params);
        $rows = $queryStmt->fetchAll();

        // Récupérer les sessions actives pour ces comptes
        $userIds = array_column($rows, 'id');
        $sessionStats = [];
        if (!empty($userIds)) {
            $inClause = implode(',', array_fill(0, count($userIds), '?'));
            $sStmt = $pdo->prepare("
                SELECT user_id, COUNT(*) AS session_count, MAX(created_at) AS last_activity
                FROM sessions
                WHERE user_id IN ({$inClause})
                GROUP BY user_id
            ");
            $sStmt->execute($userIds);
            foreach ($sStmt->fetchAll() as $sRow) {
                $sessionStats[$sRow['user_id']] = $sRow;
            }
        }

        $items = [];
        foreach ($rows as $r) {
            $usertype = (int)$r['usertype'];
            $roleLabel = match ($usertype) {
                0 => 'patient',
                1 => 'doctor',
                2 => 'clinic',
                3 => 'superadmin',
                4 => 'admin',
                default => 'user'
            };

            // Calcul du statut unifié
            $statusKey = 'active';
            $isFrozen = false;
            $freezeReason = null;
            $isDeleted = false;

            if ($usertype === 0) {
                if (!empty($r['patient_deleted'])) {
                    $statusKey = 'deleted';
                    $isDeleted = true;
                } elseif (!empty($r['patient_frozen'])) {
                    $statusKey = 'frozen';
                    $isFrozen = true;
                    $freezeReason = $r['patient_freeze_reason'];
                }
            } elseif ($usertype === 1) {
                if (!empty($r['doctor_frozen'])) {
                    $statusKey = 'frozen';
                    $isFrozen = true;
                    $freezeReason = $r['doctor_freeze_reason'];
                } elseif ($r['doctor_status'] === 'PENDING') {
                    $statusKey = 'pending';
                } elseif ($r['doctor_status'] === 'REJECTED') {
                    $statusKey = 'rejected';
                }
            } elseif ($usertype === 2) {
                if (!empty($r['clinic_frozen'])) {
                    $statusKey = 'frozen';
                    $isFrozen = true;
                    $freezeReason = $r['clinic_freeze_reason'];
                } elseif ($r['clinic_status'] === 'PENDING') {
                    $statusKey = 'pending';
                } elseif ($r['clinic_status'] === 'REJECTED') {
                    $statusKey = 'rejected';
                }
            }

            $createdAt = $r['patient_created'] ?: ($r['doctor_approved'] ?: ($r['clinic_approved'] ?: null));
            $sData = $sessionStats[$r['id']] ?? null;

            $items[] = [
                'id'                    => $r['id'],
                'username'              => $r['username'],
                'usertype'              => $usertype,
                'user_type'             => $usertype,
                'role'                  => $roleLabel,
                'name'                  => $r['name'] ?: $r['username'],
                'display_name'          => $r['name'] ?: $r['username'],
                'email'                 => $r['email'] ?: null,
                'phone'                 => $r['phone'] ?: null,
                'nin'                   => $r['patient_nin'] ?: ($r['doctor_nin'] ?: null),
                'status'                => $statusKey,
                'is_frozen'             => $isFrozen,
                'freeze_reason'         => $freezeReason,
                'is_deleted'            => $isDeleted,
                'created_at'            => $createdAt,
                'last_activity'         => $sData['last_activity'] ?? null,
                'active_sessions_count' => (int)($sData['session_count'] ?? 0),
            ];
        }

        Response::success([
            'items'        => $items,
            'total'        => $total,
            'page'         => $page,
            'limit'        => $limit,
            'total_pages'  => (int)ceil($total / $limit),
            'stats'        => self::getGlobalStats($pdo),
        ]);
    }

    /**
     * GET /api/superadmin/accounts/stats
     * Statistiques globales des comptes TABIBI.
     */
    public static function getStats(): void {
        AuthMiddleware::superAdminOnly();
        $pdo = Database::getInstance();
        Response::success(self::getGlobalStats($pdo));
    }

    /**
     * Calcul optimisé des statistiques de tous les comptes.
     */
    public static function getGlobalStats(\PDO $pdo): array {
        // 1. Users by usertype
        $uStmt = $pdo->query("SELECT usertype, COUNT(*) as c FROM users GROUP BY usertype");
        $usersByType = [];
        $totalUsers = 0;
        foreach ($uStmt->fetchAll() as $row) {
            $usersByType[(int)$row['usertype']] = (int)$row['c'];
            $totalUsers += (int)$row['c'];
        }

        // 2. Patients summary
        $pStmt = $pdo->query("
            SELECT 
                SUM(CASE WHEN (deleteacount = 0 OR deleteacount IS NULL) AND (is_frozen = 0 OR is_frozen IS NULL) THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN is_frozen = 1 THEN 1 ELSE 0 END) as frozen,
                SUM(CASE WHEN deleteacount = 1 THEN 1 ELSE 0 END) as deleted
            FROM patients
        ");
        $pRow = $pStmt->fetch() ?: [];

        // 3. Doctors summary
        $dStmt = $pdo->query("
            SELECT 
                SUM(CASE WHEN status = 'APPROVED' AND (is_frozen = 0 OR is_frozen IS NULL) THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN is_frozen = 1 THEN 1 ELSE 0 END) as frozen
            FROM doctors
        ");
        $dRow = $dStmt->fetch() ?: [];

        // 4. Clinics summary
        $cStmt = $pdo->query("
            SELECT 
                SUM(CASE WHEN status = 'APPROVED' AND (is_frozen = 0 OR is_frozen IS NULL) THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN is_frozen = 1 THEN 1 ELSE 0 END) as frozen
            FROM clinics
        ");
        $cRow = $cStmt->fetch() ?: [];

        // 5. Sessions summary
        $sStmt = $pdo->query("
            SELECT 
                COUNT(*) as total_active,
                COUNT(DISTINCT user_id) as users_active
            FROM sessions
        ");
        $sRow = $sStmt->fetch() ?: [];

        $patientsActive  = (int)($pRow['active'] ?? 0);
        $patientsFrozen  = (int)($pRow['frozen'] ?? 0);
        $patientsDeleted = (int)($pRow['deleted'] ?? 0);

        $doctorsApproved = (int)($dRow['approved'] ?? 0);
        $doctorsPending  = (int)($dRow['pending'] ?? 0);
        $doctorsFrozen   = (int)($dRow['frozen'] ?? 0);

        $clinicsApproved = (int)($cRow['approved'] ?? 0);
        $clinicsPending  = (int)($cRow['pending'] ?? 0);
        $clinicsFrozen   = (int)($cRow['frozen'] ?? 0);

        return [
            'total_users' => $totalUsers,
            'patients' => [
                'total'    => $usersByType[0] ?? 0,
                'active'   => $patientsActive,
                'frozen'   => $patientsFrozen,
                'deleted'  => $patientsDeleted,
                'inactive' => $patientsFrozen + $patientsDeleted,
            ],
            'doctors' => [
                'total'    => $usersByType[1] ?? 0,
                'approved' => $doctorsApproved,
                'pending'  => $doctorsPending,
                'frozen'   => $doctorsFrozen,
                'inactive' => $doctorsPending + $doctorsFrozen,
            ],
            'clinics' => [
                'total'    => $usersByType[2] ?? 0,
                'approved' => $clinicsApproved,
                'pending'  => $clinicsPending,
                'frozen'   => $clinicsFrozen,
                'inactive' => $clinicsPending + $clinicsFrozen,
            ],
            'admins' => [
                'superadmin' => $usersByType[3] ?? 0,
                'staff'      => $usersByType[4] ?? 0,
            ],
            'sessions' => [
                'total_active' => (int)($sRow['total_active'] ?? 0),
                'users_active' => (int)($sRow['users_active'] ?? 0),
            ]
        ];
    }

    /**
     * GET /api/superadmin/accounts/:id
     * Détails complets d'un compte cible et de son profil métier.
     */
    public static function getAccount(string $id): void {
        AuthMiddleware::superAdminOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id, username, usertype FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::notFound('الحساب غير موجود.');
        }

        $usertype = (int)$user['usertype'];
        $profile = null;
        $stats = [];

        if ($usertype === 0) {
            $pStmt = $pdo->prepare("
                SELECT id, reference, fullname, phone, email, birthdate, address, gender,
                       bloodtype, nin, speakinglanguage, emailvalidation, phonevalidation,
                       deleteacount, is_frozen, freeze_reason, frozen_at, consent_at
                FROM patients 
                WHERE user_id = ? LIMIT 1
            ");
            $pStmt->execute([$id]);
            $profile = $pStmt->fetch() ?: null;

            if ($profile) {
                // Rendez-vous
                $aStmt = $pdo->prepare("
                    SELECT 
                        COUNT(*) as total_appointments,
                        SUM(CASE WHEN status = 0 AND apointementdate > NOW() THEN 1 ELSE 0 END) as upcoming_appointments,
                        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as completed_appointments,
                        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as cancelled_appointments
                    FROM apointements
                    WHERE patient_id = ?
                ");
                $aStmt->execute([$profile['id']]);
                $stats = $aStmt->fetch() ?: [];
            }
        } elseif ($usertype === 1) {
            $dStmt = $pdo->prepare("
                SELECT d.id, d.fullname, d.address, d.phone, d.email, d.specialtie_id,
                       d.pricing, d.status, d.is_frozen, d.freeze_reason, d.frozen_at,
                       d.approvedat, d.nin, d.emailvalidation, d.phonevalidation,
                       s.namefr as specialty_fr, s.namear as specialty_ar
                FROM doctors d
                LEFT JOIN specialties s ON s.id = d.specialtie_id
                WHERE d.user_id = ? LIMIT 1
            ");
            $dStmt->execute([$id]);
            $profile = $dStmt->fetch() ?: null;

            if ($profile) {
                // Cliniques associées
                $cStmt = $pdo->prepare("
                    SELECT c.id, c.clinicname, c.phone, cd.status
                    FROM clinicsdoctors cd
                    JOIN clinics c ON c.id = cd.clinic_id
                    WHERE cd.doctor_id = ?
                ");
                $cStmt->execute([$profile['id']]);
                $profile['clinics'] = $cStmt->fetchAll();
            }
        } elseif ($usertype === 2) {
            $cStmt = $pdo->prepare("
                SELECT id, clinicname, phone, address, email, website, emergency,
                       typeclinic, status, is_frozen, freeze_reason, frozen_at,
                       approvedat, emailvalidation, phonevalidation
                FROM clinics 
                WHERE user_id = ? LIMIT 1
            ");
            $cStmt->execute([$id]);
            $profile = $cStmt->fetch() ?: null;

            if ($profile) {
                // Médecins associés
                $dStmt = $pdo->prepare("
                    SELECT d.id, d.fullname, cd.status
                    FROM clinicsdoctors cd
                    JOIN doctors d ON d.id = cd.doctor_id
                    WHERE cd.clinic_id = ?
                ");
                $dStmt->execute([$profile['id']]);
                $profile['doctors'] = $dStmt->fetchAll();
            }
        } elseif ($usertype === 3 || $usertype === 4) {
            $profile = [
                'role_label' => $usertype === 3 ? 'SuperAdmin' : 'Admin Staff',
                'username'   => $user['username']
            ];
        }

        // Sessions actives
        $sStmt = $pdo->prepare("
            SELECT id, SUBSTRING(token, 1, 8) as token_prefix, created_at
            FROM sessions 
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $sStmt->execute([$id]);
        $activeSessions = $sStmt->fetchAll();

        $roleLabel = match ($usertype) {
            0 => 'patient',
            1 => 'doctor',
            2 => 'clinic',
            3 => 'superadmin',
            4 => 'admin',
            default => 'user'
        };

        $isAnonymized = !empty($profile['deleteacount']) || str_starts_with((string)$user['username'], 'DELETED_');
        $isFrozen = !empty($profile['is_frozen']);
        $isActive = !$isAnonymized && !$isFrozen;

        Response::success([
            'account'         => [
                'id'            => $user['id'],
                'username'      => $user['username'],
                'usertype'      => $usertype,
                'role'          => $roleLabel,
                'email'         => $profile['email'] ?? null,
                'phone'         => $profile['phone'] ?? null,
                'is_frozen'     => $isFrozen,
                'freeze_reason' => $profile['freeze_reason'] ?? null,
                'frozen_at'     => $profile['frozen_at'] ?? null,
                'is_anonymized' => $isAnonymized ? 1 : 0,
                'is_active'     => $isActive ? 1 : 0,
                'created_at'    => $profile['created_at'] ?? ($profile['approvedat'] ?? null),
                'last_activity' => $activeSessions[0]['created_at'] ?? null,
            ],
            'id'              => $user['id'],
            'username'        => $user['username'],
            'usertype'        => $usertype,
            'role'            => $roleLabel,
            'profile'         => $profile,
            'stats'           => $stats,
            'sessions'        => $activeSessions,
            'active_sessions' => $activeSessions,
            'session_count'   => count($activeSessions),
        ]);
    }

    /**
     * POST /api/superadmin/accounts/:id/toggle-status
     * Activer / Désactiver (geler / dégeler) le compte cible.
     */
    public static function toggleStatus(string $id): void {
        $session = AuthMiddleware::superAdminOnly();
        $pdo = Database::getInstance();

        // Protection 1 : Auto-blocage interdit
        if ($id === $session['user_id']) {
            Response::error('لا يمكنك تجميد أو تعديل حالة حسابك الخاص.', 403);
        }

        $stmt = $pdo->prepare("SELECT id, username, usertype FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $targetUser = $stmt->fetch();

        if (!$targetUser) {
            Response::notFound('الحساب غير موجود.');
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $freeze = !empty($data['is_frozen']);
        $reason = trim((string)($data['reason'] ?? ($data['freeze_reason'] ?? '')));

        if ($freeze && empty($reason)) {
            $reason = 'Compte suspendu par le SuperAdmin';
        }

        $targetUsertype = (int)$targetUser['usertype'];

        // Protection 2 : Ne pas désactiver le dernier SuperAdmin
        if ($targetUsertype === 3 && $freeze) {
            $superCount = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE usertype = 3")->fetchColumn();
            if ($superCount <= 1) {
                Response::error('لا يمكن تعطيل المشرف العام الوحيد المتبقي في النظام.', 400);
            }
        }

        $pdo->beginTransaction();
        try {
            $isFrozenVal = $freeze ? 1 : 0;
            $freezeReasonVal = $freeze ? $reason : null;
            $frozenAtVal = $freeze ? date('Y-m-d H:i:s') : null;

            if ($targetUsertype === 1) {
                // Médecin
                $pdo->prepare("UPDATE doctors SET is_frozen = ?, freeze_reason = ?, frozen_at = ? WHERE user_id = ?")
                    ->execute([$isFrozenVal, $freezeReasonVal, $frozenAtVal, $id]);
            } elseif ($targetUsertype === 2) {
                // Clinique
                $pdo->prepare("UPDATE clinics SET is_frozen = ?, freeze_reason = ?, frozen_at = ? WHERE user_id = ?")
                    ->execute([$isFrozenVal, $freezeReasonVal, $frozenAtVal, $id]);
            } elseif ($targetUsertype === 0) {
                // Patient
                $pdo->prepare("UPDATE patients SET is_frozen = ?, freeze_reason = ?, frozen_at = ? WHERE user_id = ?")
                    ->execute([$isFrozenVal, $freezeReasonVal, $frozenAtVal, $id]);
            }

            // Invalidation immédiate des sessions en cas de désactivation
            if ($freeze) {
                $pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$id]);
            }

            $pdo->commit();

            // Notification de sécurité si gelé
            if ($freeze) {
                try {
                    require_once __DIR__ . '/../helpers/NotificationHelper.php';
                    NotificationHelper::notify(
                        $id,
                        'تنبيه بشأن حالة الحساب',
                        "تم تجميد حسابك من قِبَل الإدارة. السبب: {$reason}. يرجى التواصل مع الدعم الفني.",
                        'warning'
                    );
                } catch (\Throwable $e) {}
            }

            Response::success([
                'id'            => $id,
                'is_frozen'     => $isFrozenVal,
                'freeze_reason' => $freezeReasonVal,
            ], $freeze ? 'تم تجميد الحساب بنجاح وإلغاء جلساته النشطة.' : 'تم إلغاء تجميد الحساب وتفعيله بنجاح.');

        } catch (\Throwable $e) {
            $pdo->rollBack();
            Response::serverError('حدث خطأ أثناء تعديل حالة الحساب.');
        }
    }

    /**
     * POST /api/superadmin/accounts/:id/invalidate-sessions
     * Forcer l'invalidation de toutes les sessions actives d'un compte.
     */
    public static function invalidateSessions(string $id): void {
        AuthMiddleware::superAdminOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            Response::notFound('الحساب غير موجود.');
        }

        $sCountStmt = $pdo->prepare("SELECT COUNT(*) FROM sessions WHERE user_id = ?");
        $sCountStmt->execute([$id]);
        $count = (int)$sCountStmt->fetchColumn();

        $delStmt = $pdo->prepare("DELETE FROM sessions WHERE user_id = ?");
        $delStmt->execute([$id]);

        Response::success([
            'user_id'           => $id,
            'sessions_revoked'  => $count,
        ], "تم إلغاء {$count} جلسة نشطة بنجاح.");
    }

    /**
     * POST /api/superadmin/accounts/:id/reset-password
     *
     * Stratégie d'atomicité (pattern commit-first + verify) :
     *   1. commit() en premier — si ça échoue, aucun email n'est envoyé (pas d'incohérence)
     *   2. SELECT post-commit pour confirmer que le hash est réellement persisté en DB
     *      (garde contre le cas extrêmement rare où commit() retourne sans erreur
     *       mais l'écriture n'a pas abouti)
     *   3. Envoi email uniquement après confirmation DB
     *   4. Si email échoue après commit confirmé → email_sent=false, admin agit manuellement
     *      Le mot de passe est correct en DB — l'utilisateur peut demander un nouveau reset.
     *
     * NB : Il n'existe pas de solution 100% atomique pour deux systèmes distribués
     * (DB + SMTP). Ce pattern est le standard industrie (Stripe, GitHub, etc.).
     */
    public static function resetPassword(string $id): void {
        AuthMiddleware::superAdminOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id, username, usertype FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::notFound('الحساب غير موجود.');
        }

        // Génération d'un mot de passe temporaire robuste (12 caractères hexadécimaux)
        $newPlainPassword = bin2hex(random_bytes(6));
        $newHashedPassword = PasswordHelper::hash($newPlainPassword);

        // Rechercher l'email AVANT la transaction (lecture seule, sans lock)
        $email    = null;
        $name     = $user['username'];
        $usertype = (int)$user['usertype'];

        if ($usertype === 0) {
            $p = $pdo->prepare("SELECT email, fullname FROM patients WHERE user_id = ? LIMIT 1");
            $p->execute([$id]);
            $row   = $p->fetch();
            $email = $row['email'] ?? null;
            $name  = $row['fullname'] ?? $name;
        } elseif ($usertype === 1) {
            $p = $pdo->prepare("SELECT email, fullname FROM doctors WHERE user_id = ? LIMIT 1");
            $p->execute([$id]);
            $row   = $p->fetch();
            $email = $row['email'] ?? null;
            $name  = $row['fullname'] ?? $name;
        } elseif ($usertype === 2) {
            $p = $pdo->prepare("SELECT email, clinicname FROM clinics WHERE user_id = ? LIMIT 1");
            $p->execute([$id]);
            $row   = $p->fetch();
            $email = $row['email'] ?? null;
            $name  = $row['clinicname'] ?? $name;
        }

        $hasValidEmail = !empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL);

        // ── PHASE 1 : Écriture DB + commit ──────────────────────────────────────
        $pdo->beginTransaction();
        try {
            $pdo->prepare("UPDATE users SET password = ? WHERE id = ?")
                ->execute([$newHashedPassword, $id]);

            $pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$id]);

            // commit() en premier — si ça lève une exception, aucun email n'est envoyé
            $pdo->commit();

        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            // NE PAS logger $newPlainPassword
            Response::serverError('حدث خطأ أثناء إعادة تعيين كلمة المرور.');
        }

        // ── PHASE 2 : Vérification post-commit ──────────────────────────────────
        // Confirme que le hash est réellement persisté avant d'envoyer l'email.
        // Garde contre le cas (extrêmement rare) où commit() retourne sans erreur
        // mais l'écriture DB n'a pas abouti (ex: réplication asynchrone, storage bug).
        try {
            $verifyStmt = $pdo->prepare("SELECT password FROM users WHERE id = ? LIMIT 1");
            $verifyStmt->execute([$id]);
            $storedHash = $verifyStmt->fetchColumn();
        } catch (\Throwable $e) {
            // Impossible de vérifier — on n'envoie pas l'email par sécurité
            // Le password peut ou non avoir été commité — l'admin doit investiguer
            Response::error(
                'تم إعادة تعيين كلمة المرور لكن تعذّر التحقق من التخزين. يرجى التحقق من الحساب قبل أي action.',
                503
            );
        }

        if ($storedHash !== $newHashedPassword) {
            // Le hash en DB ne correspond pas à celui généré → commit n'a pas abouti
            // L'email NE DOIT PAS être envoyé
            Response::error(
                'تعذّر التحقق من حفظ كلمة المرور في قاعدة البيانات. لم يتم إرسال أي بريد. يرجى المحاولة مرة أخرى.',
                503
            );
        }

        // ── PHASE 3 : Envoi email (DB confirmée) ────────────────────────────────
        // À ce stade, le hash est confirmé en DB. Si l'email échoue, le password
        // est correct en DB et l'admin voit email_sent=false pour action manuelle.
        $emailSent = false;
        if ($hasValidEmail) {
            // sendPasswordReset(email, name, plainPassword) — EmailHelper existant
            // NE PAS logger $newPlainPassword
            $emailSent = EmailHelper::sendPasswordReset($email, $name, $newPlainPassword);
        }

        // Avertissement de sécurité : NE JAMAIS retourner le mot de passe dans l'API
        Response::success([
            'user_id'    => $id,
            'email_sent' => $emailSent,
            'email'      => $email ? self::maskEmail($email) : null,
            'note'       => !$hasValidEmail
                ? 'Aucun email valide associé à ce compte. Le mot de passe a été réinitialisé — transmettre les accès manuellement.'
                : (!$emailSent ? 'L\'email n\'a pas pu être envoyé. Le mot de passe est correctement réinitialisé en base. Contactez l\'utilisateur par un autre canal.' : null),
        ], 'تمت إعادة تعيين كلمة المرور بنجاح وإلغاء كافة الجلسات النشطة.');
    }



    /**
     * POST /api/superadmin/accounts/:id/anonymize
     * Supprimer et anonymiser définitivement un compte en réutilisant le mécanisme Phase 02D.
     */
    public static function anonymizeAccount(string $id): void {
        $session = AuthMiddleware::superAdminOnly();
        $pdo = Database::getInstance();

        // Protection 1 : Auto-suppression interdite
        if ($id === $session['user_id']) {
            Response::error('لا يمكنك حذف أو إخفاء هوية حسابك الخاص.', 403);
        }

        $stmt = $pdo->prepare("SELECT id, username, usertype FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::notFound('الحساب غير موجود.');
        }

        $usertype = (int)$user['usertype'];

        // Protection 2 : Interdit de supprimer les comptes d'administration
        if (in_array($usertype, [3, 4], true)) {
            Response::error('لا يمكن حذف أو إخفاء هوية حسابات الإدارة عبر هذه العملية.', 403);
        }

        $anonymId = 'DELETED_' . substr($id, 0, 8);

        $pdo->beginTransaction();
        try {
            if ($usertype === 0) {
                // Application stricte de la suppression chirurgicale Phase 02D
                $pStmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
                $pStmt->execute([$id]);
                $patient = $pStmt->fetch();

                if ($patient) {
                    $patientId = $patient['id'];

                    // 1. Anonymisation complète du profil patient
                    $pdo->prepare("
                        UPDATE patients SET
                            fullname              = '[Compte supprimé]',
                            email                 = NULL,
                            phone                 = NULL,
                            address               = NULL,
                            birthdate             = NULL,
                            birthplace            = NULL,
                            birthcountry          = NULL,
                            postcode              = NULL,
                            nin                   = NULL,
                            bloodtype             = NULL,
                            speakinglanguage      = NULL,
                            baladiya_id           = NULL,
                            doctor_id             = NULL,
                            emergancyphone        = NULL,
                            emergancyemail        = NULL,
                            emergancyphonedoctor  = NULL,
                            emergancynote         = NULL,
                            photoprofile          = NULL,
                            deleteacount          = 1
                        WHERE id = ?
                    ")->execute([$patientId]);

                    // 2. Annuler les rendez-vous futurs non honorés
                    $pdo->prepare("
                        UPDATE apointements 
                        SET status = 1, updatedat = NOW() 
                        WHERE patient_id = ? AND apointementdate > NOW() AND status = 0
                    ")->execute([$patientId]);

                    // 3. Dissocier l'identité des rendez-vous passés
                    $pdo->prepare("
                        UPDATE apointements 
                        SET patientname = '[Compte supprimé]', phone = NULL 
                        WHERE patient_id = ?
                    ")->execute([$patientId]);

                    // 4. Clôturer les tickets de support ouverts
                    $pdo->prepare("
                        UPDATE tickets 
                        SET status = 'CLOSED' 
                        WHERE patient_id = ? AND status != 'CLOSED'
                    ")->execute([$patientId]);

                    // 5. Masquer les avis publics
                    $pdo->prepare("
                        UPDATE doctorsratings 
                        SET hidepatient = 1 
                        WHERE patient_id = ?
                    ")->execute([$patientId]);
                }
            } elseif ($usertype === 1) {
                // Médecin : gel définitif + anonymisation contact direct
                $pdo->prepare("
                    UPDATE doctors SET
                        is_frozen = 1,
                        freeze_reason = 'Compte désactivé et fermé par le SuperAdmin',
                        frozen_at = NOW()
                    WHERE user_id = ?
                ")->execute([$id]);
            } elseif ($usertype === 2) {
                // Clinique : gel définitif
                $pdo->prepare("
                    UPDATE clinics SET
                        is_frozen = 1,
                        freeze_reason = 'Compte désactivé et fermé par le SuperAdmin',
                        frozen_at = NOW()
                    WHERE user_id = ?
                ")->execute([$id]);
            }

            // Anonymisation du compte racine users
            $pdo->prepare("UPDATE users SET username = ?, password = 'DELETED' WHERE id = ?")
                ->execute([$anonymId, $id]);

            // Invalidation définitive de toutes les sessions
            $pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$id]);

            $pdo->commit();

            Response::success([
                'user_id'     => $id,
                'anonymized'  => true,
            ], 'تم حذف وتجريد الحساب من البيانات الشخصية بنجاح وفق معايير الحماية.');

        } catch (\Throwable $e) {
            $pdo->rollBack();
            Response::serverError('حدث خطأ أثناء حذف وتجريد بيانات الحساب.');
        }
    }

    /**
     * PUT /api/superadmin/accounts/:id
     * Modifier les informations administratives autorisées.
     */
    public static function updateAccount(string $id): void {
        AuthMiddleware::superAdminOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id, username, usertype FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::notFound('الحساب غير موجود.');
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $usertype = (int)$user['usertype'];

        $pdo->beginTransaction();
        try {
            // Mise à jour de l'username si fourni
            if (!empty($data['username'])) {
                $newUsername = strtolower(trim((string)$data['username']));
                if ($newUsername !== $user['username']) {
                    $uStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? AND id != ?");
                    $uStmt->execute([$newUsername, $id]);
                    if ($uStmt->fetchColumn() > 0) {
                        Response::error('اسم المستخدم هذا محجوز مسبقاً.', 409);
                    }
                    $pdo->prepare("UPDATE users SET username = ? WHERE id = ?")->execute([$newUsername, $id]);
                }
            }

            // Mise à jour des profils spécifiques
            if ($usertype === 0) {
                // Patient
                $name = trim((string)($data['fullname'] ?? ''));
                $email = trim((string)($data['email'] ?? ''));
                $phone = trim((string)($data['phone'] ?? ''));

                if ($email !== '' && UserValidationHelper::isEmailDuplicate($email, $id)) {
                    Response::error('البريد الإلكتروني مستخدم مسبقاً.', 409);
                }
                if ($phone !== '' && UserValidationHelper::isPhoneDuplicate($phone, $id)) {
                    Response::error('رقم الهاتف مستخدم مسبقاً.', 409);
                }

                $pdo->prepare("
                    UPDATE patients SET
                        fullname = COALESCE(NULLIF(?, ''), fullname),
                        email    = COALESCE(NULLIF(?, ''), email),
                        phone    = COALESCE(NULLIF(?, ''), phone)
                    WHERE user_id = ?
                ")->execute([$name, $email, $phone, $id]);

            } elseif ($usertype === 1) {
                // Médecin
                $name = trim((string)($data['fullname'] ?? ''));
                $email = trim((string)($data['email'] ?? ''));
                $phone = trim((string)($data['phone'] ?? ''));

                if ($email !== '' && UserValidationHelper::isEmailDuplicate($email, $id)) {
                    Response::error('البريد الإلكتروني مستخدم مسبقاً.', 409);
                }

                $pdo->prepare("
                    UPDATE doctors SET
                        fullname = COALESCE(NULLIF(?, ''), fullname),
                        email    = COALESCE(NULLIF(?, ''), email),
                        phone    = COALESCE(NULLIF(?, ''), phone)
                    WHERE user_id = ?
                ")->execute([$name, $email, $phone, $id]);

            } elseif ($usertype === 2) {
                // Clinique
                $name = trim((string)($data['clinicname'] ?? ''));
                $email = trim((string)($data['email'] ?? ''));
                $phone = trim((string)($data['phone'] ?? ''));

                if ($email !== '' && UserValidationHelper::isEmailDuplicate($email, $id)) {
                    Response::error('البريد الإلكتروني مستخدم مسبقاً.', 409);
                }

                $pdo->prepare("
                    UPDATE clinics SET
                        clinicname = COALESCE(NULLIF(?, ''), clinicname),
                        email      = COALESCE(NULLIF(?, ''), email),
                        phone      = COALESCE(NULLIF(?, ''), phone)
                    WHERE user_id = ?
                ")->execute([$name, $email, $phone, $id]);
            }

            $pdo->commit();
            Response::success(['id' => $id], 'تم تحديث المعلومات الإدارية بنجاح.');

        } catch (\Throwable $e) {
            $pdo->rollBack();
            Response::serverError('حدث خطأ أثناء تحديث المعلومات.');
        }
    }

    /**
     * Masquer une adresse email pour l'affichage de confirmation (ex: j***@domain.com)
     */
    private static function maskEmail(string $email): string {
        $parts = explode('@', $email);
        if (count($parts) !== 2) return $email;
        $name = $parts[0];
        $domain = $parts[1];
        $maskedName = substr($name, 0, 1) . str_repeat('*', max(1, strlen($name) - 2)) . (strlen($name) > 1 ? substr($name, -1) : '');
        return $maskedName . '@' . $domain;
    }
}
