<?php
// ============================================================
// controllers/SyncController.php
// مزامنة ثنائية الاتجاه بين برنامج دلفي المحلي والاستضافة
//
// الاتجاهات:
//  UPLOAD  (محلي → سيرفر) : POST /api/sync/upload
//  DOWNLOAD (سيرفر → محلي): GET  /api/sync/download
//  DELETE  (حذف مزامن)    : POST /api/sync/delete
//  status  (إحصاءات)      : GET  /api/sync/status
//  LOG     (سجل العمليات) : GET  /api/sync/logs
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';

class SyncController {

    // ──────────────────────────────────────────────────────────
    // POST /api/sync/upload
    //
    // دلفي يرسل مصفوفة من المواعيد المحلية (IsUpload=false)
    // Body JSON:
    // {
    //   "appointments": [
    //     {
    //       "id":               "uuid",
    //       "patientname":      "محمد أمين",
    //       "birthdate":        "1990-05-15 00:00:00",  // اختياري
    //       "phone":            "0699123456",
    //       "appointementdate": "2026-05-01 09:30:00",
    //       "note":             "ملاحظة",
    //       "apointementcolor": 0,
    //       "weight":           75.5,
    //       "height":           175.0,
    //       "imc":              24.7,
    //       "pas":              120.0,
    //       "pac":              80.0,
    //       "oxygen":           98.0,
    //       "heartbeats":       72.0,
    //       "reason_id":        "uuid-or-null",
    //       "doctor_id":        "uuid",
    //       "isdelete":         false
    //     }
    //   ]
    // }
    //
    // الرد:
    // {
    //   "synced":  ["id1","id2"],   // تمت مزامنتها
    //   "failed":  [{"id":"x","error":"..."}],
    //   "summary": { "created":5, "updated":2, "deleted":1 }
    // }
    // ──────────────────────────────────────────────────────────
    public static function upload(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();
        $input   = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($input['appointments']) || !is_array($input['appointments'])) {
            Response::error("الحقل 'appointments' (مصفوفة) مطلوب.", 422);
        }

        // Récupérer le doctor_id du médecin connecté
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound("ملف الطبيب غير موجود.");

        $doctor_id = $doctor['id'];

        // Trouver le clinicsdoctor_id par défaut (première clinique du médecin)
        $reqClinicId = trim((string)($input["clinic_id"] ?? ($_GET["clinic_id"] ?? "")));
        $clinicDoctor = null;
        if (!empty($reqClinicId)) {
            $stmt = $pdo->prepare("
                SELECT id as clinicsdoctor_id, clinic_id 
                FROM clinicsdoctors 
                WHERE doctor_id = ? AND clinic_id = ? AND UPPER(status) IN ('APPROVED', 'ACCEPTED')
                LIMIT 1
            ");
            $stmt->execute([$doctor_id, $reqClinicId]);
            $clinicDoctor = $stmt->fetch();
        }
        if (!$clinicDoctor) {
            $stmt = $pdo->prepare("
                SELECT id as clinicsdoctor_id, clinic_id 
                FROM clinicsdoctors 
                WHERE doctor_id = ? AND UPPER(status) IN ('APPROVED', 'ACCEPTED')
                ORDER BY is_owner DESC, id ASC
                LIMIT 1
            ");
            $stmt->execute([$doctor_id]);
            $clinicDoctor = $stmt->fetch();
        }
        // clinicsdoctor_id peut être null si pas de clinique liée

        $synced  = [];
        $failed  = [];
        $created = 0;
        $updated = 0;
        $deleted = 0;

        $appointments = $input['appointments'];
        $maxBatch     = 500; // سقف حماية
        if (count($appointments) > $maxBatch) {
            Response::error("الحد الأقصى للمزامنة هو $maxBatch موعد في المرة الواحدة.", 422);
        }

        foreach ($appointments as $appt) {
            try {
                $id = self::sanitizeUUID($appt['id'] ?? '');
                if (!$id) {
                    $failed[] = ['id' => $appt['id'] ?? 'unknown', 'error' => 'id invalide'];
                    continue;
                }

                // Vérifier si l'appointment appartient à ce médecin
                if (!empty($appt['doctor_id']) && $appt['doctor_id'] !== $doctor_id) {
                    $failed[] = ['id' => $id, 'error' => 'doctor_id ne correspond pas'];
                    continue;
                }

                $isdelete = (bool)($appt['isdelete'] ?? false);

                // Vérifier si existant
                $stmt = $pdo->prepare("SELECT id, source FROM apointements WHERE id = ? LIMIT 1");
                $stmt->execute([$id]);
                $existing = $stmt->fetch();

                if ($isdelete) {
                    // Suppression logique
                    if ($existing) {
                        $pdo->prepare("UPDATE apointements SET status=1, updatedat=NOW() WHERE id=?")
                            ->execute([$id]);
                        $deleted++;
                    }
                    $synced[] = $id;
                    continue;
                }

                // Trouver le reason_id correspondant
                $reasonId = null;
                if (!empty($appt['reason_id'])) {
                    // Chercher dans doctorsreasons d'abord
                    $stmt2 = $pdo->prepare("
                        SELECT id FROM doctorsreasons 
                        WHERE id = ? 
                        LIMIT 1
                    ");
                    $stmt2->execute([$appt['reason_id']]);
                    $r = $stmt2->fetch();
                    $reasonId = $r['id'] ?? null;

                    if (!$reasonId) {
                        // Chercher dans reasons ensuite
                        $stmt2 = $pdo->prepare("
                            SELECT id FROM reasons 
                            WHERE id = ? 
                            LIMIT 1
                        ");
                        $stmt2->execute([$appt['reason_id']]);
                        $r = $stmt2->fetch();
                        $reasonId = $r['id'] ?? null;
                    }
                }

                $appointmentDate = self::sanitizeDatetime($appt['apointementdate'] ?? '');
                if (!$appointmentDate) {
                    $failed[] = ['id' => $id, 'error' => 'apointementdate invalide'];
                    continue;
                }

                $data = [
                    'patientname'      => mb_substr(trim($appt['patientname'] ?? ''), 0, 100),
                    'birthdate'        => self::sanitizeDatetime($appt['birthdate'] ?? ''),
                    'phone'            => mb_substr(trim($appt['phone'] ?? ''), 0, 50),
                    'apointementdate'  => $appointmentDate,
                    'notes'            => mb_substr(trim($appt['note'] ?? ''), 0, 500),
                    'apointementcolor' => (int)($appt['apointementcolor'] ?? 0),
                    'weight'           => self::sanitizeDouble($appt['weight'] ?? null),
                    'height'           => self::sanitizeDouble($appt['height'] ?? null),
                    'imc'              => self::sanitizeDouble($appt['imc'] ?? null),
                    'pas'              => self::sanitizeDouble($appt['pas'] ?? null),
                    'pac'              => self::sanitizeDouble($appt['pac'] ?? null),
                    'oxygen'           => self::sanitizeDouble($appt['oxygen'] ?? null),
                    'heartbeats'       => self::sanitizeDouble($appt['heartbeats'] ?? null),
                    'reason_id'        => $reasonId,
                    'clinicsdoctor_id' => $clinicDoctor['clinicsdoctor_id'] ?? null,
                    'status'           => 0, // Pending/New
                    'updatedat'        => date('Y-m-d H:i:s'),
                ];

                if (!$existing) {
                    // INSERT
                    $pdo->prepare("
                        INSERT INTO apointements 
                            (id, patientname, birthdate, phone, apointementdate, note,
                             apointementcolor, weight, height, imc, pas, pac, oxygen, heartbeats,
                             reason_id, clinicsdoctor_id, status, updatedat)
                        VALUES 
                            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ")->execute([
                        $id,
                        $data['patientname'],
                        $data['birthdate'],
                        $data['phone'],
                        $data['apointementdate'],
                        $data['notes'],
                        $data['apointementcolor'],
                        $data['weight'],
                        $data['height'],
                        $data['imc'],
                        $data['pas'],
                        $data['pac'],
                        $data['oxygen'],
                        $data['heartbeats'],
                        $data['reason_id'],
                        $data['clinicsdoctor_id'],
                        $data['status'],
                        $data['updatedat'],
                    ]);
                    $created++;
                } else {
                    // UPDATE
                    $pdo->prepare("
                        UPDATE apointements SET
                            patientname      = COALESCE(NULLIF(?, ''), patientname),
                            birthdate        = COALESCE(?, birthdate),
                            phone            = COALESCE(NULLIF(?, ''), phone),
                            apointementdate  = ?,
                            apointementcolor = ?,
                            weight           = COALESCE(?, weight),
                            height           = COALESCE(?, height),
                            imc              = COALESCE(?, imc),
                            pas              = COALESCE(?, pas),
                            pac              = COALESCE(?, pac),
                            oxygen           = COALESCE(?, oxygen),
                            heartbeats       = COALESCE(?, heartbeats),
                            reason_id        = COALESCE(?, reason_id),
                            note             = ?,
                            updatedat        = NOW()
                        WHERE id = ?
                    ")->execute([
                        $data['patientname'],
                        $data['birthdate'],
                        $data['phone'],
                        $data['apointementdate'],
                        $data['apointementcolor'],
                        $data['weight'],
                        $data['height'],
                        $data['imc'],
                        $data['pas'],
                        $data['pac'],
                        $data['oxygen'],
                        $data['heartbeats'],
                        $data['reason_id'],
                        $data['notes'],
                        $id,
                    ]);
                    $updated++;
                }

                $synced[] = $id;

            } catch (Throwable $e) {
                $failed[] = ['id' => $appt['id'] ?? 'unknown', 'error' => $e->getMessage()];
            }
        }

        // Enregistrer le log
        self::writeLog($doctor_id, 'upload', count($appointments), $created, $updated, $deleted, count($failed), $failed);

        Response::success([
            'synced'  => $synced,
            'failed'  => $failed,
            'summary' => [
                'processed' => count($appointments),
                'created'   => $created,
                'updated'   => $updated,
                'deleted'   => $deleted,
                'failed'    => count($failed),
            ],
        ], "اكتملت المزامنة: تم إنشاء $created، وتحديث $updated، وحذف $deleted.");
    }

    // ──────────────────────────────────────────────────────────
    // GET /api/sync/download
    //
    // دلفي يطلب المواعيد المحجوزة عبر الموقع
    // Query params:
    //   since     = "2026-01-01 00:00:00"  آخر تاريخ مزامنة (اختياري)
    //   include_deleted = 1                 لتضمين المحذوفة (لمعرفة ما يجب حذفه)
    //
    // الرد: مصفوفة بنفس هيكل جدول الدلفي
    // ──────────────────────────────────────────────────────────
    public static function download(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound("ملف الطبيب غير موجود.");

        $doctor_id       = $doctor['id'];
        $since          = $_GET['since'] ?? '';
        $inclDeleted    = (int)($_GET['include_deleted'] ?? 0);
        $limit          = min(1000, max(1, (int)($_GET['limit'] ?? 500)));
        $page           = max(1, (int)($_GET['page'] ?? 1));
        $offset         = ($page - 1) * $limit;

        // Construire la requête
        $where  = ["(cd.doctor_id = ? OR a.doctor_id = ?)"];
        $params = [$doctor_id, $doctor_id];

        if ($since) {
            $sinceClean = self::sanitizeDatetime($since);
            if ($sinceClean) {
                $where[]  = "(a.updatedat > ?)";
                $params[] = $sinceClean;
            }
        }

        if (!$inclDeleted) {
            $where[] = "a.status != 1";
        }

        $clinicIdParam = trim((string)($_GET["clinic_id"] ?? ""));
        if (!empty($clinicIdParam)) {
            $where[]  = "(cd.clinic_id = ?)";
            $params[] = $clinicIdParam;
        }

        $whereSQL = implode(' AND ', $where);

        // Compter le total
        $countStmt = $pdo->prepare("
            SELECT COUNT(DISTINCT a.id)
            FROM apointements a
            LEFT JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
            WHERE $whereSQL
        ");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        // Récupérer les données
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $pdo->prepare("
            SELECT
                a.id,
                COALESCE(p.fullname, a.patientname)   AS patientname,
                COALESCE(p.phone,    a.phone)          AS phone,
                COALESCE(p.birthdate, a.birthdate)    AS birthdate,
                a.apointementdate,
                a.note,
                COALESCE(a.apointementcolor, 0)        AS apointementcolor,
                a.weight,
                a.height,
                a.imc,
                a.pas,
                a.pac,
                a.oxygen,
                a.heartbeats,
                a.status,
                a.updatedat as syncedat,
                a.reason_id,
                COALESCE(dr.reason_name, r.name) as reason_name,
                cd.doctor_id  AS doctor_id,
                cd.clinic_id  AS clinic_id,
                a.clinicsdoctor_id,
                a.patient_id,
                p.email       AS PatientEmail
            FROM apointements a
            LEFT JOIN clinicsdoctors cd ON cd.id  = a.clinicsdoctor_id
            LEFT JOIN doctorsreasons dr ON dr.id = a.reason_id
            LEFT JOIN reasons         r ON r.id = a.reason_id
            LEFT JOIN patients         p ON p.id  = a.patient_id
            WHERE $whereSQL
            ORDER BY a.apointementdate ASC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute($params);
        $appointments = $stmt->fetchAll();

        // Nettoyer les valeurs nulles
        $appointments = array_map(fn($a) => array_map(
            fn($v) => $v === null ? null : $v,
            $a
        ), $appointments);

        // Log
        self::writeLog($doctor_id, 'download', $total, 0, 0, 0, 0, []);

        Response::success([
            'appointments' => $appointments,
            'total'        => $total,
            'page'         => $page,
            'limit'        => $limit,
            'total_pages'  => ceil($total / $limit),
            'downloaded_at'=> date('Y-m-d H:i:s'),
        ]);
    }

    // ──────────────────────────────────────────────────────────
    // POST /api/sync/delete
    //
    // دلفي يُبلّغ عن المواعيد المحذوفة محلياً (isdelete=true)
    // Body: { "ids": ["uuid1", "uuid2", ...] }
    // ──────────────────────────────────────────────────────────
    public static function delete(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();
        $input   = json_decode(file_get_contents('php://input'), true) ?? [];

        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound("ملف الطبيب غير موجود.");

        $ids = $input['ids'] ?? [];
        if (!is_array($ids) || empty($ids)) {
            Response::error("معرفات المواعيد (ids) مطلوبة.", 422);
        }

        $deleted = 0;
        $notFound = [];

        foreach ($ids as $id) {
            $cleanId = self::sanitizeUUID($id);
            if (!$cleanId) continue;

            // Vérifier ownership
            $stmt2 = $pdo->prepare("
                SELECT id FROM apointements
                WHERE id = ? AND clinicsdoctor_id IN (SELECT id FROM clinicsdoctors WHERE doctor_id = ?)
                LIMIT 1
            ");
            $stmt2->execute([$cleanId, $doctor['id']]);
            if (!$stmt2->fetch()) {
                $notFound[] = $cleanId;
                continue;
            }

            $pdo->prepare("UPDATE apointements SET status = 1, updatedat = NOW() WHERE id = ?")
                ->execute([$cleanId]);
            $deleted++;
        }

        self::writeLog($doctor['id'], 'delete', count($ids), 0, 0, $deleted, count($notFound), []);

        Response::success([
            'deleted'   => $deleted,
            'not_found' => $notFound,
        ], "تم تحديد $deleted موعد كـمحذوف.");
    }

    // ──────────────────────────────────────────────────────────
    // GET /api/sync/status
    //
    // إحصاءات المزامنة للطبيب
    // ──────────────────────────────────────────────────────────
    public static function status(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id, fullname FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound("ملف الطبيب غير موجود.");

        $did = $doctor['id'];

        // Statistiques
        $stmt = $pdo->prepare("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN a.status != 0 THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN a.status = 0  THEN 1 ELSE 0 END) as deleted,
                MAX(a.updatedat) as last_sync
            FROM apointements a
            WHERE a.clinicsdoctor_id IN (SELECT id FROM clinicsdoctors WHERE doctor_id = ?)
        ");
        $stmt->execute([$did]);
        $stats = $stmt->fetch();

        // Prochains rendez-vous web (non synchronisés)
        $stmt2 = $pdo->prepare("
            SELECT COUNT(*) as count
            FROM apointements a
            WHERE a.clinicsdoctor_id IN (SELECT id FROM clinicsdoctors WHERE doctor_id = ?)
              AND a.status != 0
              AND a.apointementdate >= NOW()
        ");
        $stmt2->execute([$did]);
        $upcoming = $stmt2->fetchColumn();

        // Dernier log
        $stmt3 = $pdo->prepare("
            SELECT Direction, CountProcessed, ExecutedAt
            FROM sync_logs
            WHERE doctor_id = ?
            ORDER BY ExecutedAt DESC LIMIT 1
        ");
        $stmt3->execute([$did]);
        $lastLog = $stmt3->fetch();

        Response::success([
            'doctor'       => ['id' => $did, 'name' => $doctor['fullname']],
            'stats'        => [
                'total_appointments'  => (int)$stats['total'],
                'active'              => (int)($stats['active'] ?? 0),
                'deleted'             => (int)($stats['deleted'] ?? 0),
                'upcoming_web'        => (int)$upcoming,
                'last_sync'           => $stats['last_sync'],
            ],
            'last_operation' => $lastLog ?: null,
            'server_time'  => date('Y-m-d H:i:s'),
        ]);
    }

    // ──────────────────────────────────────────────────────────
    // GET /api/sync/logs?limit=20
    // سجل عمليات المزامنة
    // ──────────────────────────────────────────────────────────
    public static function logs(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound("ملف الطبيب غير موجود.");

        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));

        $stmt2 = $pdo->prepare("
            SELECT id, Direction, CountProcessed, CountCreated, CountUpdated,
                   CountDeleted, CountFailed, ExecutedAt
            FROM sync_logs
            WHERE doctor_id = ?
            ORDER BY ExecutedAt DESC
            LIMIT ?
        ");
        $stmt2->execute([$doctor['id'], $limit]);

        Response::success($stmt2->fetchAll());
    }

    // ──────────────────────────────────────────────────────────
    // POST /api/sync/reasons
    //
    // دلفي يجلب قائمة الأسباب المتاحة للطبيب
    // (لمطابقة reason_id المحلي مع doctorsreason_id على السيرفر)
    // ──────────────────────────────────────────────────────────
    public static function reasons(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound("ملف الطبيب غير موجود.");

        $stmt2 = $pdo->prepare("
            SELECT 
                id,
                name as namear,
                name as namefr,
                NULL as time,
                NULL as color
            FROM reasons
            WHERE specialtie_id = (SELECT specialtie_id FROM clinicsdoctors WHERE doctor_id = ? LIMIT 1)
            ORDER BY name
        ");
        $stmt2->execute([$doctor['id']]);

        Response::success($stmt2->fetchAll());
    }

    // ──────────────────────────────────────────────────────────
    // Private Helpers
    // ──────────────────────────────────────────────────────────
    private static function sanitizeUUID(string $id): string {
        $clean = preg_replace('/[^a-fA-F0-9\-]/', '', $id);
        if (strlen($clean) < 36) return '';
        return strtoupper(substr($clean, 0, 36));
    }

    private static function sanitizeDatetime(?string $dt): ?string {
        if (empty($dt)) return null;
        // Gérer 1899-12-30 (format Delphi pour date vide)
        if (substr($dt, 0, 4) === '1899' || substr($dt, 0, 4) === '1900') return null;
        // Extraire une date valide
        if (preg_match('/(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?)/', $dt, $m)) {
            $ts = strtotime($m[1]);
            if ($ts === false || $ts < 0) return null;
            return date('Y-m-d H:i:s', $ts);
        }
        return null;
    }

    private static function sanitizeDouble($val): ?float {
        if ($val === null || $val === '' || $val === false) return null;
        $f = (float)$val;
        return ($f > 0) ? $f : null;
    }

    private static function writeLog(
        string $doctor_id, string $direction,
        int $processed, int $created, int $updated, int $deleted, int $failed,
        array $errors
    ): void {
        try {
            $pdo = Database::getInstance();
            $id  = UUIDHelper::generate();
            $pdo->prepare("
                INSERT INTO sync_logs 
                    (id, doctor_id, Direction, CountProcessed, CountCreated, CountUpdated, CountDeleted, CountFailed, ErrorDetails)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ")->execute([
                $id, $doctor_id, $direction,
                $processed, $created, $updated, $deleted, $failed,
                $errors ? json_encode($errors, JSON_UNESCAPED_UNICODE) : null
            ]);
        } catch (Throwable $e) {
            // Ne pas bloquer la réponse principale si le log échoue
        }
    }

    // ============================================================
    // ============================================================
    // Device Pairing (QR Code & 6-Digit Mobile Pairing)
    // ============================================================

    /**
     * Ensure sync_device_pairings schema is up-to-date and supports persistent links
     */
    private static function ensureSyncPairingSchema(PDO $pdo): void {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `sync_device_pairings` (
                `id` CHAR(36) NOT NULL PRIMARY KEY,
                `code` VARCHAR(6) NOT NULL,
                `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                `doctor_id` CHAR(36) NULL,
                `user_id` CHAR(36) NULL,
                `clinic_id` CHAR(36) NULL,
                `token` VARCHAR(128) NULL,
                `device_name` VARCHAR(150) NULL DEFAULT 'البرنامج المكتبي للعيادة',
                `paired_at` DATETIME NULL,
                `expires_at` DATETIME NOT NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_code` (`code`),
                INDEX `idx_status` (`status`),
                INDEX `idx_expires` (`expires_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        try {
            $pdo->exec("ALTER TABLE `sync_device_pairings` MODIFY `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING'");
        } catch (\Throwable $e) {}

        try {
            $pdo->exec("ALTER TABLE `sync_device_pairings` ADD COLUMN `device_name` VARCHAR(150) NULL DEFAULT 'البرنامج المكتبي للعيادة' AFTER `token`");
        } catch (\Throwable $e) {}

        try {
            $pdo->exec("ALTER TABLE `sync_device_pairings` ADD COLUMN `paired_at` DATETIME NULL AFTER `device_name`");
        } catch (\Throwable $e) {}
    }

    /**
     * POST /api/sync/device/init
     * Initiates a pairing session requested by the desktop app.
     * Unauthenticated endpoint.
     */
    public static function initDevicePairing(): void {
        $pdo = Database::getInstance();
        self::ensureSyncPairingSchema($pdo);

        // Clean only expired PENDING sessions. NEVER delete APPROVED pairings!
        $pdo->exec("DELETE FROM `sync_device_pairings` WHERE `status` = 'PENDING' AND `expires_at` < NOW()");

        $rawInput = json_decode(file_get_contents('php://input'), true) ?? [];
        $deviceName = trim((string)($rawInput['device_name'] ?? 'البرنامج المكتبي للعيادة'));

        $sessionId = UUIDHelper::generate();
        $code = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        // Ensure uniqueness for active codes
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM `sync_device_pairings` WHERE `code` = ? AND `expires_at` > NOW()");
        $stmtCheck->execute([$code]);
        while ((int)$stmtCheck->fetchColumn() > 0) {
            $code = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
            $stmtCheck->execute([$code]);
        }

        $stmt = $pdo->prepare("
            INSERT INTO `sync_device_pairings` (`id`, `code`, `status`, `device_name`, `expires_at`)
            VALUES (?, ?, 'PENDING', ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
        ");
        $stmt->execute([$sessionId, $code, $deviceName]);

        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'tabibi.dz');
        if (strpos($baseUrl, 'localhost') === false && strpos($baseUrl, '127.0.0.1') === false) {
            $baseUrl = 'https://tabibi.dz';
        }
        $qrUrl = $baseUrl . '/pair?code=' . $code . '&session=' . $sessionId;

        Response::success([
            'session_id' => $sessionId,
            'code' => $code,
            'qr_url' => $qrUrl,
            'expires_in_seconds' => 600
        ], 'Session de liaison initialisée');
    }

    /**
     * GET /api/sync/device/check
     * Polled by desktop app to check if doctor has approved from their phone.
     */
    public static function checkDevicePairing(): void {
        $pdo = Database::getInstance();
        self::ensureSyncPairingSchema($pdo);
        $sessionId = trim((string)($_GET['session_id'] ?? ''));
        $code = trim((string)($_GET['code'] ?? ''));

        if (empty($sessionId) && empty($code)) {
            Response::error('session_id ou code requis', 422);
        }

        $query = "SELECT * FROM `sync_device_pairings` WHERE ";
        $params = [];
        if (!empty($sessionId)) {
            $query .= "`id` = ?";
            $params[] = $sessionId;
        } else {
            $query .= "`code` = ?";
            $params[] = $code;
        }
        $query .= " LIMIT 1";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $pairing = $stmt->fetch();

        if (!$pairing) {
            Response::error('Session introuvable ou expirée', 404);
        }

        if ($pairing['status'] === 'PENDING' && strtotime($pairing['expires_at']) < time()) {
            Response::json(['success' => false, 'status' => 'EXPIRED', 'message' => 'Session expirée']);
            return;
        }

        if ($pairing['status'] === 'PENDING') {
            Response::json(['success' => true, 'status' => 'PENDING', 'message' => 'En attente d\'approbation']);
            return;
        }

        if ($pairing['status'] === 'APPROVED') {
            $stmtDoc = $pdo->prepare("SELECT `fullname` FROM `doctors` WHERE `id` = ? LIMIT 1");
            $stmtDoc->execute([$pairing['doctor_id']]);
            $docName = $stmtDoc->fetchColumn() ?: 'Dr. Praticien';

            $clinicName = 'Cabinet Médical';
            $isOwner = true;
            if (!empty($pairing['clinic_id'])) {
                $stmtC = $pdo->prepare("
                    SELECT c.`clinicname`, cd.`is_owner` 
                    FROM `clinics` c
                    LEFT JOIN `clinicsdoctors` cd ON cd.`clinic_id` = c.`id` AND cd.`doctor_id` = ?
                    WHERE c.`id` = ? LIMIT 1
                ");
                $stmtC->execute([$pairing['doctor_id'], $pairing['clinic_id']]);
                $cRow = $stmtC->fetch();
                if ($cRow) {
                    $clinicName = $cRow['clinicname'] ?: 'Cabinet Médical';
                    $isOwner = (bool)($cRow['is_owner'] ?? false);
                }
            }

            // All clinics where this doctor works (owned + affiliated)
            $stmtAll = $pdo->prepare("
                SELECT cd.`clinic_id`, c.`clinicname`, cd.`is_owner`
                FROM `clinicsdoctors` cd
                JOIN `clinics` c ON c.`id` = cd.`clinic_id`
                WHERE cd.`doctor_id` = ? AND UPPER(cd.`status`) IN ('APPROVED', 'ACCEPTED')
                ORDER BY cd.`is_owner` DESC, c.`clinicname` ASC
            ");
            $stmtAll->execute([$pairing['doctor_id']]);
            $allClinics = array_map(function($c) {
                return [
                    'id' => $c['clinic_id'],
                    'name' => $c['clinicname'],
                    'is_owner' => (bool)$c['is_owner']
                ];
            }, $stmtAll->fetchAll(PDO::FETCH_ASSOC));

            Response::json([
                'success' => true,
                'status' => 'APPROVED',
                'message' => 'Appareil autorisé avec succès',
                'data' => [
                    'token' => $pairing['token'],
                    'doctorId' => $pairing['doctor_id'],
                    'doctorName' => $docName,
                    'clinicId' => $pairing['clinic_id'] ?: 'clinic-main',
                    'clinicName' => $clinicName,
                    'isOwner' => $isOwner,
                    'clinics' => $allClinics,
                    'clinicSelected' => !empty($pairing['clinic_id']),
                    'serverUrl' => 'https://tabibi.dz'
                ]
            ]);
            return;
        }

        if ($pairing['status'] === 'REVOKED') {
            Response::json(['success' => false, 'status' => 'REVOKED', 'message' => 'Liaison révoquée']);
            return;
        }

        Response::error('Statut inconnu', 400);
    }

    /**
     * GET /api/sync/device/details
     * Called by doctor's mobile to view details before approving.
     * Authenticated by doctor session.
     */
    public static function getDevicePairingDetails(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo = Database::getInstance();
        self::ensureSyncPairingSchema($pdo);
        $code = trim((string)($_GET['code'] ?? ''));
        $sessionId = trim((string)($_GET['session_id'] ?? ''));

        if (empty($code) && empty($sessionId)) {
            Response::error('Code ou session_id requis', 422);
        }

        $query = "SELECT * FROM `sync_device_pairings` WHERE ";
        $params = [];
        if (!empty($code)) {
            $query .= "`code` = ?";
            $params[] = $code;
        } else {
            $query .= "`id` = ?";
            $params[] = $sessionId;
        }
        $query .= " AND `expires_at` > NOW() LIMIT 1";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $pairing = $stmt->fetch();

        if (!$pairing) {
            Response::error('Code de liaison introuvable ou expiré', 404);
        }

        // Fetch current doctor details
        $stmtDoc = $pdo->prepare("SELECT `id`, `fullname` FROM `doctors` WHERE `user_id` = ? LIMIT 1");
        $stmtDoc->execute([$session['user_id']]);
        $doctor = $stmtDoc->fetch();

        // Fetch doctor clinics (both owned and working in)
        $clinics = [];
        $pairedClinicMap = [];
        if ($doctor) {
            $stmtC = $pdo->prepare("
                SELECT cd.`clinic_id`, c.`clinicname`, cd.`is_owner`
                FROM `clinicsdoctors` cd
                JOIN `clinics` c ON c.`id` = cd.`clinic_id`
                WHERE cd.`doctor_id` = ? AND UPPER(cd.`status`) IN ('APPROVED', 'ACCEPTED')
                ORDER BY cd.`is_owner` DESC, c.`clinicname` ASC
            ");
            $stmtC->execute([$doctor['id']]);
            $clinics = $stmtC->fetchAll(PDO::FETCH_ASSOC);

            // Fetch already active pairings for this doctor
            $stmtPaired = $pdo->prepare("
                SELECT `clinic_id`, `paired_at`, `created_at`
                FROM `sync_device_pairings`
                WHERE `doctor_id` = ? AND `status` = 'APPROVED'
            ");
            $stmtPaired->execute([$doctor['id']]);
            $pairedRows = $stmtPaired->fetchAll(PDO::FETCH_ASSOC);
            foreach ($pairedRows as $pr) {
                $pairedClinicMap[$pr['clinic_id']] = $pr['paired_at'] ?: $pr['created_at'];
            }
        }

        $primaryClinic = !empty($clinics) ? $clinics[0] : null;
        $primaryClinicId = $primaryClinic ? $primaryClinic['clinic_id'] : 'clinic-main';

        Response::success([
            'session_id' => $pairing['id'],
            'code' => $pairing['code'],
            'status' => $pairing['status'],
            'device_name' => $pairing['device_name'] ?: 'البرنامج المكتبي للعيادة',
            'doctor_name' => $doctor ? $doctor['fullname'] : 'Docteur',
            'clinic_id' => $primaryClinicId,
            'clinic_name' => $primaryClinic ? $primaryClinic['clinicname'] : 'Mon Cabinet',
            'is_already_paired' => isset($pairedClinicMap[$primaryClinicId]),
            'paired_at' => $pairedClinicMap[$primaryClinicId] ?? null,
            'clinics' => array_map(function($c) use ($pairedClinicMap) {
                $cid = $c['clinic_id'];
                $isPaired = isset($pairedClinicMap[$cid]);
                return [
                    'id' => $cid,
                    'name' => $c['clinicname'],
                    'is_owner' => (bool)$c['is_owner'],
                    'is_already_paired' => $isPaired,
                    'paired_at' => $isPaired ? $pairedClinicMap[$cid] : null
                ];
            }, $clinics)
        ]);
    }

    /**
     * POST /api/sync/device/approve
     * Approves the pairing session from doctor's phone.
     * Authenticated by doctor session.
     */
    public static function approveDevicePairing(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo = Database::getInstance();
        self::ensureSyncPairingSchema($pdo);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $code = trim((string)($input['code'] ?? ''));
        $sessionId = trim((string)($input['session_id'] ?? ''));

        if (empty($code) && empty($sessionId)) {
            Response::error('Code ou session_id requis', 422);
        }

        $query = "SELECT * FROM `sync_device_pairings` WHERE ";
        $params = [];
        if (!empty($code)) {
            $query .= "`code` = ?";
            $params[] = $code;
        } else {
            $query .= "`id` = ?";
            $params[] = $sessionId;
        }
        $query .= " AND `expires_at` > NOW() AND `status` = 'PENDING' LIMIT 1";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $pairing = $stmt->fetch();

        if (!$pairing) {
            Response::error('Demande de liaison introuvable ou déjà traitée', 404);
        }

        // Fetch current doctor details
        $stmtDoc = $pdo->prepare("SELECT `id`, `fullname` FROM `doctors` WHERE `user_id` = ? LIMIT 1");
        $stmtDoc->execute([$session['user_id']]);
        $doctor = $stmtDoc->fetch();
        if (!$doctor) {
            Response::notFound('Fiche praticien introuvable.');
        }

        // Fetch doctor clinics (both owned and affiliated)
        $stmtC = $pdo->prepare("
            SELECT cd.`clinic_id`, c.`clinicname`, cd.`is_owner`
            FROM `clinicsdoctors` cd
            JOIN `clinics` c ON c.`id` = cd.`clinic_id`
            WHERE cd.`doctor_id` = ? AND UPPER(cd.`status`) IN ('APPROVED', 'ACCEPTED')
            ORDER BY cd.`is_owner` DESC, c.`clinicname` ASC
        ");
        $stmtC->execute([$doctor['id']]);
        $doctorClinics = $stmtC->fetchAll(PDO::FETCH_ASSOC);

        $selectedClinic = null;
        $reqClinicId = trim((string)($input['clinic_id'] ?? ''));
        if (!empty($reqClinicId)) {
            foreach ($doctorClinics as $c) {
                if ($c['clinic_id'] === $reqClinicId) {
                    $selectedClinic = $c;
                    break;
                }
            }
        }
        if (!$selectedClinic && !empty($doctorClinics)) {
            $selectedClinic = $doctorClinics[0];
        }

        $clinicId = $selectedClinic ? $selectedClinic['clinic_id'] : 'clinic-main';
        $clinicName = $selectedClinic ? $selectedClinic['clinicname'] : 'Cabinet Médical';

        // Check if doctor is ALREADY linked to this clinic
        $stmtAlready = $pdo->prepare("
            SELECT `id`, `paired_at`, `created_at` 
            FROM `sync_device_pairings` 
            WHERE `doctor_id` = ? AND `clinic_id` = ? AND `status` = 'APPROVED'
            LIMIT 1
        ");
        $stmtAlready->execute([$doctor['id'], $clinicId]);
        $alreadyLinked = $stmtAlready->fetch();

        if ($alreadyLinked) {
            Response::error('أنت مرتبط سابقاً بهذه العيادة. يرجى فصل الارتباط القديم أولاً من قائمة العيادات المرتبطة قبل إعادة الربط.', 409);
        }

        // Generate persistent desktop token in sessions table
        $token = bin2hex(random_bytes(32));
        $stmtS = $pdo->prepare("INSERT INTO `sessions` (`user_id`, `token`, `created_at`) VALUES (?, ?, NOW())");
        $stmtS->execute([$session['user_id'], $token]);

        $deviceName = trim((string)($input['device_name'] ?? ($pairing['device_name'] ?? 'البرنامج المكتبي للعيادة')));

        // Update pairing record permanently
        $stmtUp = $pdo->prepare("
            UPDATE `sync_device_pairings` 
            SET `status` = 'APPROVED', 
                `doctor_id` = ?, 
                `user_id` = ?, 
                `clinic_id` = ?, 
                `token` = ?,
                `device_name` = ?,
                `paired_at` = NOW()
            WHERE `id` = ?
        ");
        $stmtUp->execute([$doctor['id'], $session['user_id'], $clinicId, $token, $deviceName, $pairing['id']]);

        Response::success([
            'status' => 'APPROVED',
            'pairing_id' => $pairing['id'],
            'doctor_name' => $doctor['fullname'],
            'clinic_id' => $clinicId,
            'clinic_name' => $clinicName,
            'paired_at' => date('Y-m-d H:i:s')
        ], 'تم ربط البرنامج المكتبي للعيادة بنجاح وحفظه في حسابك.');
    }

    /**
     * GET /api/sync/device/list
     * جلب جميع العيادات والأجهزة المرتبط بها حساب الطبيب حالياً
     */
    public static function listDevicePairings(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo = Database::getInstance();
        self::ensureSyncPairingSchema($pdo);

        $stmtDoc = $pdo->prepare("SELECT `id` FROM `doctors` WHERE `user_id` = ? LIMIT 1");
        $stmtDoc->execute([$session['user_id']]);
        $doctor = $stmtDoc->fetch();
        if (!$doctor) Response::notFound('ملف الطبيب غير موجود.');

        $stmt = $pdo->prepare("
            SELECT 
                p.`id`,
                p.`clinic_id`,
                p.`status`,
                p.`device_name`,
                p.`paired_at`,
                p.`created_at`,
                c.`clinicname`,
                c.`address`,
                c.`wilaya`,
                c.`phone`,
                cd.`is_owner`
            FROM `sync_device_pairings` p
            LEFT JOIN `clinics` c ON c.`id` = p.`clinic_id`
            LEFT JOIN `clinicsdoctors` cd ON cd.`clinic_id` = p.`clinic_id` AND cd.`doctor_id` = p.`doctor_id`
            WHERE p.`doctor_id` = ? AND p.`status` = 'APPROVED'
            ORDER BY COALESCE(p.`paired_at`, p.`created_at`) DESC
        ");
        $stmt->execute([$doctor['id']]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $list = array_map(function($r) {
            return [
                'id' => $r['id'],
                'clinic_id' => $r['clinic_id'],
                'clinic_name' => $r['clinicname'] ?: 'عيادة غير محددة',
                'address' => $r['address'] ?? '',
                'wilaya' => $r['wilaya'] ?? '',
                'phone' => $r['phone'] ?? '',
                'is_owner' => (bool)($r['is_owner'] ?? false),
                'device_name' => $r['device_name'] ?: 'البرنامج المكتبي للعيادة',
                'paired_at' => $r['paired_at'] ?: $r['created_at'],
                'status' => $r['status']
            ];
        }, $rows);

        Response::success(['pairings' => $list]);
    }

    /**
     * POST /api/sync/device/unlink
     * فصل ارتباط جهاز/عيادة معينة وإلغاء صلاحية المزامنة فورياً
     */
    public static function unlinkDevicePairing(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo = Database::getInstance();
        self::ensureSyncPairingSchema($pdo);

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $pairingId = trim((string)($input['pairing_id'] ?? ''));
        $clinicId = trim((string)($input['clinic_id'] ?? ''));

        if (empty($pairingId) && empty($clinicId)) {
            Response::error('معرف الارتباط أو العيادة مطلوب لفصل الارتباط', 422);
        }

        $stmtDoc = $pdo->prepare("SELECT `id` FROM `doctors` WHERE `user_id` = ? LIMIT 1");
        $stmtDoc->execute([$session['user_id']]);
        $doctor = $stmtDoc->fetch();
        if (!$doctor) Response::notFound('ملف الطبيب غير موجود.');

        $query = "SELECT `id`, `token`, `clinic_id` FROM `sync_device_pairings` WHERE `doctor_id` = ? AND `status` = 'APPROVED' AND ";
        $params = [$doctor['id']];
        if (!empty($pairingId)) {
            $query .= "`id` = ?";
            $params[] = $pairingId;
        } else {
            $query .= "`clinic_id` = ?";
            $params[] = $clinicId;
        }
        $query .= " LIMIT 1";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $pairing = $stmt->fetch();

        if (!$pairing) {
            Response::error('سجل الارتباط غير موجود أو تم فصله مسبقاً', 404);
        }

        // 1. Invalidate session token from sessions table
        if (!empty($pairing['token'])) {
            $stmtDelToken = $pdo->prepare("DELETE FROM `sessions` WHERE `token` = ?");
            $stmtDelToken->execute([$pairing['token']]);
        }

        // 2. Mark pairing as REVOKED
        $stmtRevoke = $pdo->prepare("UPDATE `sync_device_pairings` SET `status` = 'REVOKED' WHERE `id` = ?");
        $stmtRevoke->execute([$pairing['id']]);

        Response::success(null, 'تم فصل الارتباط بنجاح وإلغاء صلاحية المزامنة لهذا الجهاز.');
    }

    /**
     * GET /api/sync/clinics
     * جلب جميع العيادات التي يعمل بها الطبيب (سواء كان مالكاً أو طبيباً متعاوناً)
     */
    public static function clinics(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo = Database::getInstance();

        $stmtDoc = $pdo->prepare("SELECT `id` FROM `doctors` WHERE `user_id` = ? LIMIT 1");
        $stmtDoc->execute([$session['user_id']]);
        $doctor = $stmtDoc->fetch();
        if (!$doctor) Response::notFound('ملف الطبيب غير موجود.');

        // جلب جميع العيادات المعتمدة التي ينتمي إليها الطبيب
        $stmt = $pdo->prepare("
            SELECT cd.`clinic_id`, c.`clinicname`, cd.`is_owner`
            FROM `clinicsdoctors` cd
            JOIN `clinics` c ON c.`id` = cd.`clinic_id`
            WHERE cd.`doctor_id` = ? AND UPPER(cd.`status`) IN ('APPROVED', 'ACCEPTED')
            ORDER BY cd.`is_owner` DESC, c.`clinicname` ASC
        ");
        $stmt->execute([$doctor['id']]);

        $clinics = array_map(function($c) {
            return [
                'id'       => $c['clinic_id'],
                'name'     => $c['clinicname'],
                'is_owner' => (bool)$c['is_owner']
            ];
        }, $stmt->fetchAll(PDO::FETCH_ASSOC));

        Response::success(['clinics' => $clinics]);
    }

}
