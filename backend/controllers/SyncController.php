<?php
// ============================================================
// controllers/SyncController.php
// مزامنة ثنائية الاتجاه بين برنامج دلفي المحلي والاستضافة
//
// الاتجاهات:
//  UPLOAD  (محلي → سيرفر) : POST /api/sync/upload
//  DOWNLOAD (سيرفر → محلي): GET  /api/sync/download
//  DELETE  (حذف مزامن)    : POST /api/sync/delete
//  STATUS  (إحصاءات)      : GET  /api/sync/status
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
    //       "ID":               "uuid",
    //       "PatientName":      "محمد أمين",
    //       "BirthDate":        "1990-05-15 00:00:00",  // اختياري
    //       "Phone":            "0699123456",
    //       "AppointementDate": "2026-05-01 09:30:00",
    //       "Note":             "ملاحظة",
    //       "ApointementColor": 0,
    //       "Weight":           75.5,
    //       "Height":           175.0,
    //       "IMC":              24.7,
    //       "PAS":              120.0,
    //       "PAC":              80.0,
    //       "Oxygen":           98.0,
    //       "Heartbeats":       72.0,
    //       "Reason_id":        "uuid-or-null",
    //       "Doctor_id":        "uuid",
    //       "IsDelete":         false
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

        // Récupérer le Doctor_id du médecin connecté
        $stmt = $pdo->prepare("SELECT ID FROM Doctors WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound("Profil médecin introuvable");

        $doctorId = $doctor['ID'];

        // Trouver le ClinicsDoctor_id par défaut (première clinique du médecin)
        $stmt = $pdo->prepare("
            SELECT ID as ClinicsDoctor_id, Clinic_ID 
            FROM ClinicsDoctors 
            WHERE Doctor_ID = ? 
            LIMIT 1
        ");
        $stmt->execute([$doctorId]);
        $clinicDoctor = $stmt->fetch();
        // ClinicsDoctor_id peut être null si pas de clinique liée

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
                $id = self::sanitizeUUID($appt['ID'] ?? '');
                if (!$id) {
                    $failed[] = ['id' => $appt['ID'] ?? 'unknown', 'error' => 'ID invalide'];
                    continue;
                }

                // Vérifier si l'appointment appartient à ce médecin
                if (!empty($appt['Doctor_id']) && $appt['Doctor_id'] !== $doctorId) {
                    $failed[] = ['id' => $id, 'error' => 'Doctor_id ne correspond pas'];
                    continue;
                }

                $isDelete = (bool)($appt['IsDelete'] ?? false);

                // Vérifier si existant
                $stmt = $pdo->prepare("SELECT ID, Source FROM Apointements WHERE ID = ? LIMIT 1");
                $stmt->execute([$id]);
                $existing = $stmt->fetch();

                if ($isDelete) {
                    // Suppression logique
                    if ($existing) {
                        $pdo->prepare("UPDATE Apointements SET IsDelete=1, SyncedAt=NOW() WHERE ID=?")
                            ->execute([$id]);
                        $deleted++;
                    }
                    $synced[] = $id;
                    continue;
                }

                // Trouver le DoctorsReason_id correspondant au Reason_id local
                $reasonId = null;
                if (!empty($appt['Reason_id'])) {
                    // Chercher dans DoctorsReasons par Reason_id
                    $stmt2 = $pdo->prepare("
                        SELECT ID FROM DoctorsReasons 
                        WHERE (Reason_id = ? OR ID = ?) 
                          AND Doctor_id = ?
                        LIMIT 1
                    ");
                    $stmt2->execute([$appt['Reason_id'], $appt['Reason_id'], $doctorId]);
                    $r = $stmt2->fetch();
                    $reasonId = $r['ID'] ?? null;
                }

                $appointmentDate = self::sanitizeDatetime($appt['AppointementDate'] ?? '');
                if (!$appointmentDate) {
                    $failed[] = ['id' => $id, 'error' => 'AppointementDate invalide'];
                    continue;
                }

                $data = [
                    'PatientName'      => mb_substr(trim($appt['PatientName'] ?? ''), 0, 100),
                    'BirthDate'        => self::sanitizeDatetime($appt['BirthDate'] ?? ''),
                    'Phone'            => mb_substr(trim($appt['Phone'] ?? ''), 0, 50),
                    'AppointementDate' => $appointmentDate,
                    'Note'             => mb_substr(trim($appt['Note'] ?? ''), 0, 500),
                    'ApointementColor' => (int)($appt['ApointementColor'] ?? 0),
                    'Weight'           => self::sanitizeDouble($appt['Weight'] ?? null),
                    'Height'           => self::sanitizeDouble($appt['Height'] ?? null),
                    'IMC'              => self::sanitizeDouble($appt['IMC'] ?? null),
                    'PAS'              => self::sanitizeDouble($appt['PAS'] ?? null),
                    'PAC'              => self::sanitizeDouble($appt['PAC'] ?? null),
                    'Oxygen'           => self::sanitizeDouble($appt['Oxygen'] ?? null),
                    'Heartbeats'       => self::sanitizeDouble($appt['Heartbeats'] ?? null),
                    'DoctorsReason_id' => $reasonId,
                    'ClinicsDoctor_id' => $clinicDoctor['ClinicsDoctor_id'] ?? null,
                    'Doctor_id'        => $doctorId,
                    'Source'           => 'local',
                    'IsDelete'         => 0,
                    'SyncedAt'         => date('Y-m-d H:i:s'),
                ];

                if (!$existing) {
                    // INSERT
                    $pdo->prepare("
                        INSERT INTO Apointements 
                            (ID, PatientName, BirthDate, Phone, AppointementDate, Note,
                             ApointementColor, Weight, Height, IMC, PAS, PAC, Oxygen, Heartbeats,
                             DoctorsReason_id, ClinicsDoctor_id, Doctor_id, Source, IsDelete, SyncedAt)
                        VALUES 
                            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                    ")->execute([
                        $id,
                        $data['PatientName'],
                        $data['BirthDate'],
                        $data['Phone'],
                        $data['AppointementDate'],
                        $data['Note'],
                        $data['ApointementColor'],
                        $data['Weight'],
                        $data['Height'],
                        $data['IMC'],
                        $data['PAS'],
                        $data['PAC'],
                        $data['Oxygen'],
                        $data['Heartbeats'],
                        $data['DoctorsReason_id'],
                        $data['ClinicsDoctor_id'],
                        $data['Doctor_id'],
                        $data['Source'],
                        $data['SyncedAt'],
                    ]);
                    $created++;
                } else {
                    // UPDATE (ne pas écraser les données web avec des données locales vides)
                    $pdo->prepare("
                        UPDATE Apointements SET
                            PatientName      = COALESCE(NULLIF(?, ''), PatientName),
                            BirthDate        = COALESCE(?, BirthDate),
                            Phone            = COALESCE(NULLIF(?, ''), Phone),
                            AppointementDate = ?,
                            Note             = ?,
                            ApointementColor = ?,
                            Weight           = COALESCE(?, Weight),
                            Height           = COALESCE(?, Height),
                            IMC              = COALESCE(?, IMC),
                            PAS              = COALESCE(?, PAS),
                            PAC              = COALESCE(?, PAC),
                            Oxygen           = COALESCE(?, Oxygen),
                            Heartbeats       = COALESCE(?, Heartbeats),
                            DoctorsReason_id = COALESCE(?, DoctorsReason_id),
                            Doctor_id        = ?,
                            SyncedAt         = NOW()
                        WHERE ID = ?
                    ")->execute([
                        $data['PatientName'],
                        $data['BirthDate'],
                        $data['Phone'],
                        $data['AppointementDate'],
                        $data['Note'],
                        $data['ApointementColor'],
                        $data['Weight'],
                        $data['Height'],
                        $data['IMC'],
                        $data['PAS'],
                        $data['PAC'],
                        $data['Oxygen'],
                        $data['Heartbeats'],
                        $data['DoctorsReason_id'],
                        $data['Doctor_id'],
                        $id,
                    ]);
                    $updated++;
                }

                $synced[] = $id;

            } catch (Throwable $e) {
                $failed[] = ['id' => $appt['ID'] ?? 'unknown', 'error' => $e->getMessage()];
            }
        }

        // Enregistrer le log
        self::writeLog($doctorId, 'upload', count($appointments), $created, $updated, $deleted, count($failed), $failed);

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

        $stmt = $pdo->prepare("SELECT ID FROM Doctors WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound("Profil médecin introuvable");

        $doctorId       = $doctor['ID'];
        $since          = $_GET['since'] ?? '';
        $inclDeleted    = (int)($_GET['include_deleted'] ?? 0);
        $limit          = min(1000, max(1, (int)($_GET['limit'] ?? 500)));
        $page           = max(1, (int)($_GET['page'] ?? 1));
        $offset         = ($page - 1) * $limit;

        // Construire la requête
        $where  = ["(cd.Doctor_ID = ? OR a.Doctor_id = ?)"];
        $params = [$doctorId, $doctorId];

        if ($since) {
            $sinceClean = self::sanitizeDatetime($since);
            if ($sinceClean) {
                $where[]  = "(a.CreatedAt > ? OR a.SyncedAt > ?)";
                $params[] = $sinceClean;
                $params[] = $sinceClean;
            }
        }

        if (!$inclDeleted) {
            $where[] = "a.IsDelete = 0";
        }

        // Source = web uniquement pour le download
        // (les appointments source=local ont déjà été envoyés par Delphi)
        $where[] = "a.Source = 'web'";

        $whereSQL = implode(' AND ', $where);

        // Compter le total
        $countStmt = $pdo->prepare("
            SELECT COUNT(DISTINCT a.ID)
            FROM Apointements a
            LEFT JOIN ClinicsDoctors cd ON cd.ID = a.ClinicsDoctor_id
            WHERE $whereSQL
        ");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        // Récupérer les données
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $pdo->prepare("
            SELECT
                a.ID,
                COALESCE(p.FullName, a.PatientName)   AS PatientName,
                COALESCE(p.Phone,    a.Phone)          AS Phone,
                COALESCE(p.BirthDate, a.BirthDate)    AS BirthDate,
                a.AppointementDate,
                a.Note,
                COALESCE(a.ApointementColor, 0)        AS ApointementColor,
                a.Weight,
                a.Height,
                a.IMC,
                a.PAS,
                a.PAC,
                a.Oxygen,
                a.Heartbeats,
                a.IsDelete,
                a.Source,
                a.CreatedAt,
                a.SyncedAt,
                -- Reason_id: retourner le BaseReasonId pour correspondre à la DB locale
                COALESCE(dr.Reason_id, a.DoctorsReason_id) AS Reason_id,
                dr.reason_name,
                cd.Doctor_ID  AS Doctor_id,
                cd.Clinic_ID  AS Clinic_id,
                a.ClinicsDoctor_id,
                a.DoctorsReason_id,
                a.Patient_id,
                p.Email       AS PatientEmail
            FROM Apointements a
            LEFT JOIN ClinicsDoctors cd ON cd.ID  = a.ClinicsDoctor_id
            LEFT JOIN DoctorsReasons  dr ON dr.ID = a.DoctorsReason_id
            LEFT JOIN Patients         p ON p.ID  = a.Patient_id
            WHERE $whereSQL
            ORDER BY a.AppointementDate ASC
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
        self::writeLog($doctorId, 'download', $total, 0, 0, 0, 0, []);

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
    // دلفي يُبلّغ عن المواعيد المحذوفة محلياً (IsDelete=true)
    // Body: { "ids": ["uuid1", "uuid2", ...] }
    // ──────────────────────────────────────────────────────────
    public static function delete(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();
        $input   = json_decode(file_get_contents('php://input'), true) ?? [];

        $stmt = $pdo->prepare("SELECT ID FROM Doctors WHERE User_id = ? LIMIT 1");
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
                SELECT a.ID FROM Apointements a
                LEFT JOIN ClinicsDoctors cd ON cd.ID = a.ClinicsDoctor_id
                WHERE a.ID = ? AND (cd.Doctor_ID = ? OR a.Doctor_id = ?)
                LIMIT 1
            ");
            $stmt2->execute([$cleanId, $doctor['ID'], $doctor['ID']]);
            if (!$stmt2->fetch()) {
                $notFound[] = $cleanId;
                continue;
            }

            $pdo->prepare("UPDATE Apointements SET IsDelete=1, SyncedAt=NOW() WHERE ID=?")
                ->execute([$cleanId]);
            $deleted++;
        }

        self::writeLog($doctor['ID'], 'delete', count($ids), 0, 0, $deleted, count($notFound), []);

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

        $stmt = $pdo->prepare("SELECT ID, FullName FROM Doctors WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound();

        $did = $doctor['ID'];

        // Statistiques
        $stmt = $pdo->prepare("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN Source='web'   AND IsDelete=0 THEN 1 ELSE 0 END) as web_active,
                SUM(CASE WHEN Source='local' AND IsDelete=0 THEN 1 ELSE 0 END) as local_active,
                SUM(CASE WHEN IsDelete=1 THEN 1 ELSE 0 END) as deleted,
                SUM(CASE WHEN Source='web' AND IsDelete=0 AND SyncedAt IS NULL THEN 1 ELSE 0 END) as pending_download,
                MAX(SyncedAt) as last_sync
            FROM Apointements a
            LEFT JOIN ClinicsDoctors cd ON cd.ID = a.ClinicsDoctor_id
            WHERE cd.Doctor_ID = ? OR a.Doctor_id = ?
        ");
        $stmt->execute([$did, $did]);
        $stats = $stmt->fetch();

        // Prochains rendez-vous web (non synchronisés)
        $stmt2 = $pdo->prepare("
            SELECT COUNT(*) as count
            FROM Apointements a
            LEFT JOIN ClinicsDoctors cd ON cd.ID = a.ClinicsDoctor_id
            WHERE (cd.Doctor_ID = ? OR a.Doctor_id = ?)
              AND Source = 'web'
              AND IsDelete = 0
              AND AppointementDate >= NOW()
        ");
        $stmt2->execute([$did, $did]);
        $upcoming = $stmt2->fetchColumn();

        // Dernier log
        $stmt3 = $pdo->prepare("
            SELECT Direction, CountProcessed, ExecutedAt
            FROM sync_logs
            WHERE Doctor_id = ?
            ORDER BY ExecutedAt DESC LIMIT 1
        ");
        $stmt3->execute([$did]);
        $lastLog = $stmt3->fetch();

        Response::success([
            'doctor'       => ['id' => $did, 'name' => $doctor['FullName']],
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

        $stmt = $pdo->prepare("SELECT ID FROM Doctors WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound();

        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));

        $stmt2 = $pdo->prepare("
            SELECT ID, Direction, CountProcessed, CountCreated, CountUpdated,
                   CountDeleted, CountFailed, ExecutedAt
            FROM sync_logs
            WHERE Doctor_id = ?
            ORDER BY ExecutedAt DESC
            LIMIT ?
        ");
        $stmt2->execute([$doctor['ID'], $limit]);

        Response::success($stmt2->fetchAll());
    }

    // ──────────────────────────────────────────────────────────
    // POST /api/sync/reasons
    //
    // دلفي يجلب قائمة الأسباب المتاحة للطبيب
    // (لمطابقة Reason_id المحلي مع DoctorsReason_id على السيرفر)
    // ──────────────────────────────────────────────────────────
    public static function reasons(): void {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT ID FROM Doctors WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound();

        $stmt2 = $pdo->prepare("
            SELECT 
                dr.ID          as DoctorsReason_id,
                dr.reason_name,
                dr.reason_time,
                dr.reason_color,
                dr.Reason_id   as BaseReason_id,
                r.Name         as BaseReasonName,
                dr.Clinic_id
            FROM DoctorsReasons dr
            LEFT JOIN Reasons r ON r.ID = dr.Reason_id
            WHERE dr.Doctor_id = ?
            ORDER BY dr.reason_name
        ");
        $stmt2->execute([$doctor['ID']]);

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
        string $doctorId, string $direction,
        int $processed, int $created, int $updated, int $deleted, int $failed,
        array $errors
    ): void {
        try {
            $pdo = Database::getInstance();
            $id  = UUIDHelper::generate();
            $pdo->prepare("
                INSERT INTO sync_logs 
                    (ID, Doctor_id, Direction, CountProcessed, CountCreated, CountUpdated, CountDeleted, CountFailed, ErrorDetails)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ")->execute([
                $id, $doctorId, $direction,
                $processed, $created, $updated, $deleted, $failed,
                $errors ? json_encode($errors, JSON_UNESCAPED_UNICODE) : null
            ]);
        } catch (Throwable) {
            // Ne pas bloquer la réponse principale si le log échoue
        }
    }
}
