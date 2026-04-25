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
            Response::error("Le champ 'appointments' (array) est requis", 422);
        }

        // Récupérer le doctor_id du médecin connecté
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound("Profil médecin introuvable");

        $doctor_id = $doctor['id'];

        // Trouver le clinicsdoctor_id par défaut (première clinique du médecin)
        $stmt = $pdo->prepare("
            SELECT id as clinicsdoctor_id, clinic_id 
            FROM clinicsdoctors 
            WHERE doctor_id = ? 
            LIMIT 1
        ");
        $stmt->execute([$doctor_id]);
        $clinicDoctor = $stmt->fetch();
        // clinicsdoctor_id peut être null si pas de clinique liée

        $synced  = [];
        $failed  = [];
        $created = 0;
        $updated = 0;
        $deleted = 0;

        $appointments = $input['appointments'];
        $maxBatch     = 500; // سقف حماية
        if (count($appointments) > $maxBatch) {
            Response::error("Maximum $maxBatch appointments par batch", 422);
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
                        $pdo->prepare("UPDATE apointements SET isdelete=1, syncedat=NOW() WHERE id=?")
                            ->execute([$id]);
                        $deleted++;
                    }
                    $synced[] = $id;
                    continue;
                }

                // Trouver le doctorsreason_id correspondant au reason_id local
                $reasonId = null;
                if (!empty($appt['reason_id'])) {
                    // Chercher dans doctorsreasons par reason_id
                    $stmt2 = $pdo->prepare("
                        SELECT id FROM doctorsreasons 
                        WHERE (reason_id = ? OR id = ?) 
                          AND doctor_id = ?
                        LIMIT 1
                    ");
                    $stmt2->execute([$appt['reason_id'], $appt['reason_id'], $doctor_id]);
                    $r = $stmt2->fetch();
                    $reasonId = $r['id'] ?? null;
                }

                $appointmentDate = self::sanitizeDatetime($appt['appointementdate'] ?? '');
                if (!$appointmentDate) {
                    $failed[] = ['id' => $id, 'error' => 'appointementdate invalide'];
                    continue;
                }

                $data = [
                    'patientname'      => mb_substr(trim($appt['patientname'] ?? ''), 0, 100),
                    'birthdate'        => self::sanitizeDatetime($appt['birthdate'] ?? ''),
                    'phone'            => mb_substr(trim($appt['phone'] ?? ''), 0, 50),
                    'appointementdate' => $appointmentDate,
                    'note'             => mb_substr(trim($appt['note'] ?? ''), 0, 500),
                    'apointementcolor' => (int)($appt['apointementcolor'] ?? 0),
                    'weight'           => self::sanitizeDouble($appt['weight'] ?? null),
                    'height'           => self::sanitizeDouble($appt['height'] ?? null),
                    'imc'              => self::sanitizeDouble($appt['imc'] ?? null),
                    'pas'              => self::sanitizeDouble($appt['pas'] ?? null),
                    'pac'              => self::sanitizeDouble($appt['pac'] ?? null),
                    'oxygen'           => self::sanitizeDouble($appt['oxygen'] ?? null),
                    'heartbeats'       => self::sanitizeDouble($appt['heartbeats'] ?? null),
                    'doctorsreason_id' => $reasonId,
                    'clinicsdoctor_id' => $clinicDoctor['clinicsdoctor_id'] ?? null,
                    'doctor_id'        => $doctor_id,
                    'source'           => 'local',
                    'isdelete'         => 0,
                    'syncedat'         => date('Y-m-d H:i:s'),
                ];

                if (!$existing) {
                    // INSERT
                    $pdo->prepare("
                        INSERT INTO apointements 
                            (id, patientname, birthdate, phone, appointementdate, note,
                             apointementcolor, weight, height, imc, pas, pac, oxygen, heartbeats,
                             doctorsreason_id, clinicsdoctor_id, doctor_id, source, isdelete, syncedat)
                        VALUES 
                            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                    ")->execute([
                        $id,
                        $data['patientname'],
                        $data['birthdate'],
                        $data['phone'],
                        $data['appointementdate'],
                        $data['note'],
                        $data['apointementcolor'],
                        $data['weight'],
                        $data['height'],
                        $data['imc'],
                        $data['pas'],
                        $data['pac'],
                        $data['oxygen'],
                        $data['heartbeats'],
                        $data['doctorsreason_id'],
                        $data['clinicsdoctor_id'],
                        $data['doctor_id'],
                        $data['source'],
                        $data['syncedat'],
                    ]);
                    $created++;
                } else {
                    // UPDATE (ne pas écraser les données web avec des données locales vides)
                    $pdo->prepare("
                        UPDATE apointements SET
                            patientname      = COALESCE(NULLIF(?, ''), patientname),
                            birthdate        = COALESCE(?, birthdate),
                            phone            = COALESCE(NULLIF(?, ''), phone),
                            appointementdate = ?,
                            note             = ?,
                            apointementcolor = ?,
                            weight           = COALESCE(?, weight),
                            height           = COALESCE(?, height),
                            imc              = COALESCE(?, imc),
                            pas              = COALESCE(?, pas),
                            pac              = COALESCE(?, pac),
                            oxygen           = COALESCE(?, oxygen),
                            heartbeats       = COALESCE(?, heartbeats),
                            doctorsreason_id = COALESCE(?, doctorsreason_id),
                            doctor_id        = ?,
                            syncedat         = NOW()
                        WHERE id = ?
                    ")->execute([
                        $data['patientname'],
                        $data['birthdate'],
                        $data['phone'],
                        $data['appointementdate'],
                        $data['note'],
                        $data['apointementcolor'],
                        $data['weight'],
                        $data['height'],
                        $data['imc'],
                        $data['pas'],
                        $data['pac'],
                        $data['oxygen'],
                        $data['heartbeats'],
                        $data['doctorsreason_id'],
                        $data['doctor_id'],
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
        ], "Synchronisation terminée: $created créés, $updated mis à jour, $deleted supprimés");
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
        if (!$doctor) Response::notFound("Profil médecin introuvable");

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
                $where[]  = "(a.createdat > ? OR a.syncedat > ?)";
                $params[] = $sinceClean;
                $params[] = $sinceClean;
            }
        }

        if (!$inclDeleted) {
            $where[] = "a.isdelete = 0";
        }

        // source = web uniquement pour le download
        // (les appointments source=local ont déjà été envoyés par Delphi)
        $where[] = "a.source = 'web'";

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
                a.appointementdate,
                a.note,
                COALESCE(a.apointementcolor, 0)        AS apointementcolor,
                a.weight,
                a.height,
                a.imc,
                a.pas,
                a.pac,
                a.oxygen,
                a.heartbeats,
                a.isdelete,
                a.source,
                a.createdat,
                a.syncedat,
                -- reason_id: retourner le BaseReasonId pour correspondre à la DB locale
                COALESCE(dr.reason_id, a.doctorsreason_id) AS reason_id,
                dr.reason_name,
                cd.doctor_id  AS doctor_id,
                cd.clinic_id  AS clinic_id,
                a.clinicsdoctor_id,
                a.doctorsreason_id,
                a.patient_id,
                p.email       AS PatientEmail
            FROM apointements a
            LEFT JOIN clinicsdoctors cd ON cd.id  = a.clinicsdoctor_id
            LEFT JOIN doctorsreasons  dr ON dr.id = a.doctorsreason_id
            LEFT JOIN patients         p ON p.id  = a.patient_id
            WHERE $whereSQL
            ORDER BY a.appointementdate ASC
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
        if (!$doctor) Response::notFound();

        $ids = $input['ids'] ?? [];
        if (!is_array($ids) || empty($ids)) {
            Response::error("ids (array) requis", 422);
        }

        $deleted = 0;
        $notFound = [];

        foreach ($ids as $id) {
            $cleanId = self::sanitizeUUID($id);
            if (!$cleanId) continue;

            // Vérifier ownership
            $stmt2 = $pdo->prepare("
                SELECT a.id FROM apointements a
                LEFT JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
                WHERE a.id = ? AND (cd.doctor_id = ? OR a.doctor_id = ?)
                LIMIT 1
            ");
            $stmt2->execute([$cleanId, $doctor['id'], $doctor['id']]);
            if (!$stmt2->fetch()) {
                $notFound[] = $cleanId;
                continue;
            }

            $pdo->prepare("UPDATE apointements SET isdelete=1, syncedat=NOW() WHERE id=?")
                ->execute([$cleanId]);
            $deleted++;
        }

        self::writeLog($doctor['id'], 'delete', count($ids), 0, 0, $deleted, count($notFound), []);

        Response::success([
            'deleted'   => $deleted,
            'not_found' => $notFound,
        ], "$deleted appointment(s) marqué(s) comme supprimé(s)");
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
        if (!$doctor) Response::notFound();

        $did = $doctor['id'];

        // Statistiques
        $stmt = $pdo->prepare("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN source='web'   AND isdelete=0 THEN 1 ELSE 0 END) as web_active,
                SUM(CASE WHEN source='local' AND isdelete=0 THEN 1 ELSE 0 END) as local_active,
                SUM(CASE WHEN isdelete=1 THEN 1 ELSE 0 END) as deleted,
                SUM(CASE WHEN source='web' AND isdelete=0 AND syncedat IS NULL THEN 1 ELSE 0 END) as pending_download,
                MAX(syncedat) as last_sync
            FROM apointements a
            LEFT JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
            WHERE cd.doctor_id = ? OR a.doctor_id = ?
        ");
        $stmt->execute([$did, $did]);
        $stats = $stmt->fetch();

        // Prochains rendez-vous web (non synchronisés)
        $stmt2 = $pdo->prepare("
            SELECT COUNT(*) as count
            FROM apointements a
            LEFT JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
            WHERE (cd.doctor_id = ? OR a.doctor_id = ?)
              AND source = 'web'
              AND isdelete = 0
              AND appointementdate >= NOW()
        ");
        $stmt2->execute([$did, $did]);
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
                'web_active'          => (int)$stats['web_active'],
                'local_active'        => (int)$stats['local_active'],
                'deleted'             => (int)$stats['deleted'],
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
        if (!$doctor) Response::notFound();

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
        if (!$doctor) Response::notFound();

        $stmt2 = $pdo->prepare("
            SELECT 
                dr.id          as doctorsreason_id,
                dr.reason_name,
                dr.reason_time,
                dr.reason_color,
                dr.reason_id   as BaseReason_id,
                r.name         as BaseReasonName,
                dr.clinic_id
            FROM doctorsreasons dr
            LEFT JOIN reasons r ON r.id = dr.reason_id
            WHERE dr.doctor_id = ?
            ORDER BY dr.reason_name
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
        if (str_starts_with($dt, '1899') || str_starts_with($dt, '1900')) return null;
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
        } catch (Throwable) {
            // Ne pas bloquer la réponse principale si le log échoue
        }
    }
}
