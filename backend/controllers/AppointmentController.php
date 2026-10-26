<?php
// ============================================================
// controllers/AppointmentController.php  — FIXED v2
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';
require_once __DIR__ . '/../helpers/EmailHelper.php';

class AppointmentController
{
    /**
     * GET /doctor/appointments
     * Returns appointments for the authenticated doctor within optional date range.
     * Query params: from (YYYY-MM-DD), to (YYYY-MM-DD). If omitted, returns all upcoming.
     */
    public static function getDoctorAppointments(): void
    {
        // Ensure the caller is a doctor
        $session = AuthMiddleware::doctorOnly();
        $pdo = Database::getInstance();
        $userId = $session['user_id'];

        // Resolve doctor internal id
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $doctor = $stmt->fetch();
        if (!$doctor) {
            // رسالة بشرية: ملف الطبيب غير موجود
            Response::error('لم يتم العثور على ملف طبيبك. يرجى التواصل مع الدعم الفني.', 404);
        }
        $doctorId = $doctor['id'];

        // Optional date range filters
        $from = trim($_GET['from'] ?? '');
        $to   = trim($_GET['to'] ?? '');
        $dateFilter = '';
        $params = [$doctorId];
        if ($from) {
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) {
                // رسالة بشرية: تنسيق تاريخ غير صحيح
                Response::error('صيغة تاريخ البداية غير صحيحة. الصيغة المطلوبة: سنة-شهر-يوم (2025-12-31)', 422);
            }
            $dateFilter .= " AND DATE(a.apointementdate) >= ?";
            $params[] = $from;
        }
        if ($to) {
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)) {
                // رسالة بشرية: تنسيق تاريخ النهاية غير صحيح
                Response::error('صيغة تاريخ النهاية غير صحيحة. الصيغة المطلوبة: سنة-شهر-يوم (2025-12-31)', 422);
            }
            $dateFilter .= " AND DATE(a.apointementdate) <= ?";
            $params[] = $to;
        }

        // Fetch appointments for this doctor with reason name
        $stmt = $pdo->prepare(
            "SELECT a.*,
                    COALESCE(dr.reason_name, r.name) as reason_name,
                    p.fullname as patient_fullname,
                    c.clinicname
             FROM apointements a
             JOIN clinicsdoctors cd         ON cd.id = a.clinicsdoctor_id
             LEFT JOIN doctorsreasons dr    ON dr.id = a.reason_id
             LEFT JOIN reasons r            ON r.id  = a.reason_id
             LEFT JOIN patients p           ON p.id  = a.patient_id
             LEFT JOIN clinics c            ON c.id  = cd.clinic_id
             WHERE cd.doctor_id = ?" .
            $dateFilter .
            " ORDER BY a.apointementdate ASC"
        );
        $stmt->execute($params);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success(['appointments' => $appointments]);
    }

    // ── GET /appointments/manager — Web dashboard for doctor ───────────
    public static function getForManager(): void
    {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound('Médecin introuvable');
        $doctorId = $doctor['id'];

        $from   = trim($_GET['from']   ?? '');
        $to     = trim($_GET['to']     ?? '');
        $status = isset($_GET['status']) ? (int)$_GET['status'] : null;

        $where  = ["cd.doctor_id = ?"];
        $params = [$doctorId];

        if ($from) { $where[] = "DATE(a.apointementdate) >= ?"; $params[] = $from; }
        if ($to)   { $where[] = "DATE(a.apointementdate) <= ?"; $params[] = $to; }
        if ($status !== null) { $where[] = "a.status = ?"; $params[] = $status; }

        $whereSQL = implode(' AND ', $where);


        $stmt = $pdo->prepare("
            SELECT
                a.id, a.apointementdate, a.status, a.note, a.updatedat,
                COALESCE(p.fullname, a.patientname) as patientname,
                COALESCE(p.phone,    a.phone)        as phone,
                COALESCE(dr.reason_name, r.name)     as reason_name,
                d.fullname  as doctorname,
                c.clinicname,
                cd.clinic_id as clinic_id,
                a.apointementcolor,
                a.clinicsdoctor_id,
                a.patient_id
            FROM apointements a
            JOIN clinicsdoctors cd         ON cd.id = a.clinicsdoctor_id
            JOIN doctors d                 ON d.id  = cd.doctor_id
            LEFT JOIN clinics c            ON c.id  = cd.clinic_id
            LEFT JOIN patients p           ON p.id  = a.patient_id
            LEFT JOIN doctorsreasons dr    ON dr.id = a.reason_id
            LEFT JOIN reasons r            ON r.id  = a.reason_id
            WHERE $whereSQL
            ORDER BY a.apointementdate ASC
        ");
        $stmt->execute($params);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch schedule settings (per clinic if provided, otherwise first available)
        $clinicIdParam = trim($_GET['clinic_id'] ?? '');
        if ($clinicIdParam) {
            $settingsStmt = $pdo->prepare(
                "SELECT * FROM doctorssettingapointements WHERE doctor_id = ? AND clinic_id = ? LIMIT 1"
            );
            $settingsStmt->execute([$doctorId, $clinicIdParam]);
        } else {
            $settingsStmt = $pdo->prepare(
                "SELECT * FROM doctorssettingapointements WHERE doctor_id = ? LIMIT 1"
            );
            $settingsStmt->execute([$doctorId]);
        }
        $settings = $settingsStmt->fetch(PDO::FETCH_ASSOC) ?: null;

        Response::success(['appointments' => $appointments, 'settings' => $settings]);
    }

    // ── GET /appointments/sync-check — Fast lightweight signature check for real-time sync ──
    public static function checkSync(): void
    {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound('Médecin introuvable');
        $doctorId = $doctor['id'];

        $clinicId = trim($_GET['clinic_id'] ?? '');
        $params = [$doctorId];
        $clinicSQL = "";
        if ($clinicId && $clinicId !== 'all') {
            $clinicSQL = " AND cd.clinic_id = ?";
            $params[] = $clinicId;
        }

        // Fast aggregated checksum: count of appointments, latest updatedat timestamp, and sum of statuses
        $stmt = $pdo->prepare("
            SELECT
                COUNT(*) as total_count,
                COALESCE(MAX(a.updatedat), '') as last_updated,
                COALESCE(SUM(a.status), 0) as status_checksum
            FROM apointements a
            JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
            WHERE cd.doctor_id = ? $clinicSQL
        ");
        $stmt->execute($params);
        $apptSig = $stmt->fetch(PDO::FETCH_ASSOC);

        // Also get unread notifications count for doctor user
        $notifStmt = $pdo->prepare("
            SELECT COUNT(*) as unread_count, COALESCE(MAX(created_at), '') as last_notif
            FROM notifications
            WHERE user_id = ? AND (is_read = 0 OR is_read IS NULL)
        ");
        $notifStmt->execute([$session['user_id']]);
        $notifSig = $notifStmt->fetch(PDO::FETCH_ASSOC);

        $signature = md5(
            ($apptSig['total_count'] ?? 0) . '_' .
            ($apptSig['last_updated'] ?? '') . '_' .
            ($apptSig['status_checksum'] ?? 0) . '_' .
            ($notifSig['unread_count'] ?? 0) . '_' .
            ($notifSig['last_notif'] ?? '')
        );

        Response::success([
            'signature'            => $signature,
            'appointments_count'   => (int)($apptSig['total_count'] ?? 0),
            'last_updated'         => $apptSig['last_updated'] ?? '',
            'unread_notifications' => (int)($notifSig['unread_count'] ?? 0),
        ]);
    }

    // ── PUT /appointments/:id/status — Update status from web dashboard ─
    public static function updateStatus(string $id): void
    {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!isset($data['status'])) Response::error('status requis', 422);
        $newStatus = (int)$data['status'];

        // Verify ownership
        $stmt = $pdo->prepare("
            SELECT a.id FROM apointements a
            JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
            JOIN doctors d         ON d.id  = cd.doctor_id
            WHERE a.id = ? AND d.user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$id, $session['user_id']]);
        if (!$stmt->fetch()) Response::notFound('Rendez-vous introuvable');

        // Notify patient of status update
        require_once __DIR__ . '/../helpers/NotificationHelper.php';
        try {
            $stmt = $pdo->prepare("
                SELECT a.patient_id, p.user_id, a.apointementdate, d.fullname as doctor_name
                FROM apointements a
                JOIN patients p ON p.id = a.patient_id
                JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
                JOIN doctors d ON d.id = cd.doctor_id
                WHERE a.id = ?
                LIMIT 1
            ");
            $stmt->execute([$id]);
            $apptData = $stmt->fetch();
            if ($apptData && !empty($apptData['user_id'])) {
                $formattedDate = date('Y-m-d H:i', strtotime($apptData['apointementdate']));
                $title = "تحديث موعدك";
                if ($newStatus === 1) {
                    $title = "إلغاء الموعد";
                    $msgAr = "تم إلغاء موعدك مع الطبيب: " . $apptData['doctor_name'] . " بتاريخ $formattedDate";
                } else if ($newStatus === 2) {
                    $title = "إتمام الموعد";
                    $msgAr = "تم إتمام موعدك مع الطبيب: " . $apptData['doctor_name'] . " بنجاح بتاريخ $formattedDate";
                } else {
                    $msgAr = "تم تغيير حالة موعدك مع الطبيب: " . $apptData['doctor_name'] . " بتاريخ $formattedDate";
                }
                NotificationHelper::notify($apptData['user_id'], $title, $msgAr, "appointment");
            }
        } catch (Throwable $e) {
            error_log("Failed to send status update notification: " . $e->getMessage());
        }

        $pdo->prepare("UPDATE apointements SET status = ?, updatedat = NOW() WHERE id = ?")
            ->execute([$newStatus, $id]);

        Response::success(null, 'Statut mis à jour');
    }

    // ── PUT /api/appointments/:id/queue-status — Update live queue status ──
    public static function updateQueueStatus(string $id): void
    {
        $session = AuthMiddleware::authenticate();
        if (!in_array((int)$session['usertype'], [1, 2, 3], true)) {
            Response::error('غير مسموح لك بالوصول.', 403);
        }

        $pdo = Database::getInstance();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $newQueueStatus = trim($data['queue_status'] ?? 'waiting');

        $validStatuses = ['waiting', 'in_consultation', 'completed', 'absent'];
        if (!in_array($newQueueStatus, $validStatuses, true)) {
            Response::error('حالة الطابور غير صالحة. الحالات المقبولة: waiting, in_consultation, completed, absent', 422);
        }

        $stmt = $pdo->prepare("SELECT * FROM apointements WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $appt = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$appt) {
            Response::notFound('الموعد غير موجود.');
        }

        $newStatus = (int)$appt['status'];
        if ($newQueueStatus === 'completed') {
            $newStatus = 2;
        } elseif ($newQueueStatus === 'waiting' && $newStatus === 2) {
            $newStatus = 0;
        }

        $upd = $pdo->prepare("
            UPDATE apointements 
            SET queue_status = ?, status = ?, updatedat = NOW() 
            WHERE id = ?
        ");
        $upd->execute([$newQueueStatus, $newStatus, $id]);

        Response::success([
            'id' => $id,
            'queue_status' => $newQueueStatus,
            'status' => $newStatus
        ], 'تم تحديث حالة الطابور بنجاح.');
    }

    // ── GET /api/appointments/live-queue-status — Lightweight live TV/tracker display ──
    public static function getLiveQueueStatus(): void
    {
        $pdo = Database::getInstance();
        $cdId = trim($_GET['clinics_doctor_id'] ?? '');
        $clinicId = trim($_GET['clinic_id'] ?? '');
        $date = trim($_GET['date'] ?? date('Y-m-d'));
        $shiftType = trim($_GET['shift_type'] ?? '');

        if (!$cdId) {
            try {
                $session = AuthMiddleware::authenticate();
                if ($session && !empty($session['user_id'])) {
                    $doctorId = null;
                    if ($session['user_type'] === 1) {
                        $docStmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
                        $docStmt->execute([$session['user_id']]);
                        $doctorId = $docStmt->fetchColumn();
                    }
                    if ($doctorId) {
                        if ($clinicId && $clinicId !== 'all') {
                            $cdStmt = $pdo->prepare("SELECT id FROM clinicsdoctors WHERE clinic_id = ? AND doctor_id = ? LIMIT 1");
                            $cdStmt->execute([$clinicId, $doctorId]);
                            $cdId = $cdStmt->fetchColumn() ?: '';
                        } else {
                            $cdStmt = $pdo->prepare("SELECT id FROM clinicsdoctors WHERE doctor_id = ? ORDER BY id ASC LIMIT 1");
                            $cdStmt->execute([$doctorId]);
                            $cdId = $cdStmt->fetchColumn() ?: '';
                        }
                    }
                }
            } catch (Throwable $e) {}
        }

        if (!$cdId) {
            Response::error('clinics_doctor_id مطلوب.', 422);
        }

        $shiftSql = "";
        $params = [$cdId, $date];
        if ($shiftType && in_array($shiftType, ['morning', 'evening', 'full_day'], true)) {
            $shiftSql = " AND shift_type = ?";
            $params[] = $shiftType;
        }

        // 1. Current serving patient (in_consultation)
        $stmt = $pdo->prepare("
            SELECT id, token_number, patientname, estimated_time, shift_type, updatedat
            FROM apointements
            WHERE clinicsdoctor_id = ?
              AND DATE(apointementdate) = ?
              AND queue_status = 'in_consultation'
              AND status != 1
              $shiftSql
            ORDER BY updatedat DESC
            LIMIT 1
        ");
        $stmt->execute($params);
        $currentServing = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

        // 2. Next waiting patient
        $stmt = $pdo->prepare("
            SELECT id, token_number, patientname, estimated_time, shift_type
            FROM apointements
            WHERE clinicsdoctor_id = ?
              AND DATE(apointementdate) = ?
              AND queue_status = 'waiting'
              AND status != 1
              $shiftSql
            ORDER BY token_number ASC
            LIMIT 1
        ");
        $stmt->execute($params);
        $nextWaiting = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

        // 3. Queue statistics
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) as total_count,
                SUM(CASE WHEN queue_status = 'waiting' AND status != 1 THEN 1 ELSE 0 END) as waiting_count,
                SUM(CASE WHEN queue_status = 'completed' OR status = 2 THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN queue_status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                MAX(token_number) as max_token
            FROM apointements
            WHERE clinicsdoctor_id = ?
              AND DATE(apointementdate) = ?
              $shiftSql
        ");
        $stmt->execute($params);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);

        Response::success([
            'date'            => $date,
            'current_serving' => $currentServing ? [
                'token_number'   => (int)$currentServing['token_number'],
                'patientname'    => $currentServing['patientname'],
                'estimated_time' => !empty($currentServing['estimated_time']) ? substr($currentServing['estimated_time'], 0, 5) : null,
                'shift_type'     => $currentServing['shift_type']
            ] : null,
            'next_waiting'    => $nextWaiting ? [
                'token_number'   => (int)$nextWaiting['token_number'],
                'patientname'    => $nextWaiting['patientname'],
                'estimated_time' => !empty($nextWaiting['estimated_time']) ? substr($nextWaiting['estimated_time'], 0, 5) : null,
                'shift_type'     => $nextWaiting['shift_type']
            ] : null,
            'waiting_count'   => (int)($stats['waiting_count'] ?? 0),
            'completed_count' => (int)($stats['completed_count'] ?? 0),
            'absent_count'    => (int)($stats['absent_count'] ?? 0),
            'total_today'     => (int)($stats['total_count'] ?? 0),
            'max_token'       => (int)($stats['max_token'] ?? 0)
        ]);
    }

    // ── POST /appointments/manager/add — Add from web dashboard / Walk-in desk ────────
    public static function addFromDashboard(): void
    {
        $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];

        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch();
        if (!$doctor) Response::notFound('Médecin introuvable');
        $doctorId = $doctor['id'];

        // Required fields
        $clinicsdoctor_id = trim($data['clinics_doctor_id'] ?? '');
        $date             = trim($data['date'] ?? '');
        $time             = trim($data['time'] ?? '');
        $patientname      = trim($data['patientname'] ?? '');

        if (!$clinicsdoctor_id || !$date)
            Response::error('clinics_doctor_id et date sont requis', 422);

        // Verify this clinicsdoctor belongs to the doctor
        $stmt = $pdo->prepare("SELECT id, clinic_id FROM clinicsdoctors WHERE id = ? AND doctor_id = ? LIMIT 1");
        $stmt->execute([$clinicsdoctor_id, $doctorId]);
        $cdRow = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$cdRow) Response::error('clinics_doctor_id invalide', 403);

        // Check if queue mode
        $settingsStmt = $pdo->prepare("SELECT * FROM doctorssettingapointements WHERE doctor_id = ? AND clinic_id = ? LIMIT 1");
        $settingsStmt->execute([$doctorId, $cdRow['clinic_id']]);
        $settings = $settingsStmt->fetch(PDO::FETCH_ASSOC);
        if (!$settings) {
            $settingsStmt = $pdo->prepare("SELECT * FROM doctorssettingapointements WHERE doctor_id = ? LIMIT 1");
            $settingsStmt->execute([$doctorId]);
            $settings = $settingsStmt->fetch(PDO::FETCH_ASSOC);
        }
        $bookingMode = (int)($settings['booking_mode'] ?? 0);

        $shiftType     = !empty($data['shift_type']) ? trim($data['shift_type']) : 'morning';
        $isEmergency   = !empty($data['is_emergency']) ? 1 : 0;
        $tokenNumber   = null;
        $estimatedTime = null;

        if ($bookingMode === 1) {
            $shiftMode = (int)($settings['shift_mode'] ?? 1);
            if ($shiftMode === 1) $shiftType = 'full_day';

            if (!$isEmergency) {
                $checkPhone = trim($data['phone'] ?? '');
                if ($checkPhone !== '' || !empty($patientname)) {
                    $dupStmt = $pdo->prepare("
                        SELECT token_number FROM apointements
                        WHERE clinicsdoctor_id = ? AND DATE(apointementdate) = ?
                          AND status != 1
                          AND (
                              (phone = ? AND phone != '') 
                              OR (LOWER(TRIM(patientname)) = LOWER(TRIM(?)) AND ? != '')
                          )
                        LIMIT 1
                    ");
                    $dupStmt->execute([$clinicsdoctor_id, $date, $checkPhone, $patientname, $patientname]);
                    $dupTok = $dupStmt->fetchColumn();
                    if ($dupTok) {
                        Response::error("هذا المريض مسجل بالفعل في قائمة انتظار هذا اليوم (تذكرة رقم #{$dupTok}). لا يمكن تسجيل المريض أكثر من مرة.", 409);
                    }
                }
            }

            $stmt = $pdo->prepare("
                SELECT COALESCE(MAX(token_number), 0) as max_token
                FROM apointements
                WHERE clinicsdoctor_id = ? AND DATE(apointementdate) = ? AND shift_type = ?
            ");
            $stmt->execute([$clinicsdoctor_id, $date, $shiftType]);
            $maxTok = (int)$stmt->fetchColumn();
            $tokenNumber = $maxTok + 1;

            $timescale = max(5, (int)($settings['timescale'] ?? 15));
            $shiftStart = ($shiftType === 'evening') 
                          ? self::extractTime($settings['evening_start'] ?? '', '14:00') 
                          : self::extractTime($settings['morning_start'] ?? '', '08:30');
            $startMins = (int)substr($shiftStart, 0, 2) * 60 + (int)substr($shiftStart, 3, 2);
            $estMins = $startMins + (($tokenNumber - 1) * $timescale);
            $estimatedTime = sprintf('%02d:%02d:00', floor($estMins / 60) % 24, $estMins % 60);
            $appointmentDatetime = $date . ' ' . $estimatedTime;
        } else {
            if (!$time) {
                Response::error('time est requis pour le mode par créneaux', 422);
            }
            $appointmentDatetime = $date . ' ' . preg_replace('/[^0-9:]/', '', $time) . ':00';
        }

        $reasonId = !empty($data['doctors_reason_id']) ? $data['doctors_reason_id'] : null;
        $note     = trim($data['note'] ?? '');
        $phone    = trim($data['phone'] ?? '');
        $color    = (int)($data['apointementcolor'] ?? 0);

        $appointmentId = UUIDHelper::generate();

        $pdo->prepare("
            INSERT INTO apointements
                (id, clinicsdoctor_id, apointementdate, patientname, phone, reason_id,
                 note, status, apointementcolor, updatedat,
                 token_number, shift_type, estimated_time, is_emergency, queue_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, NOW(), ?, ?, ?, ?, 'waiting')
        ")->execute([
            $appointmentId,
            $clinicsdoctor_id,
            $appointmentDatetime,
            $patientname,
            $phone,
            $reasonId,
            $note,
            $color,
            $tokenNumber,
            $shiftType,
            $estimatedTime,
            $isEmergency
        ]);

        Response::success([
            'appointment_id' => $appointmentId,
            'token_number'   => $tokenNumber,
            'shift_type'     => $shiftType,
            'estimated_time' => $estimatedTime ? substr($estimatedTime, 0, 5) : null,
            'datetime'       => $appointmentDatetime
        ], 'Rendez-vous ajouté', 201);
    }

    public static function getAvailableSlots(): void
    {
        $cdId = trim($_GET['clinics_doctor_id'] ?? '');
        $date = trim($_GET['date'] ?? '');

        if (!$cdId || !$date)
            Response::error('clinics_doctor_id et date sont requis', 422);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date))
            Response::error('Format de date invalide (YYYY-MM-DD)', 422);

        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT * FROM clinicsdoctors WHERE id = ? LIMIT 1");
        $stmt->execute([$cdId]);
        $cd = $stmt->fetch();
        if (!$cd)
            Response::notFound('Médecin/clinique introuvable');

        $doctor_id = $cd['doctor_id'];
        $clinicid = $cd['clinic_id'];

        $stmt = $pdo->prepare(
            "SELECT * FROM doctorssettingapointements WHERE doctor_id = ? AND clinic_id = ? LIMIT 1"
        );
        $stmt->execute([$doctor_id, $clinicid]);
        $settings = $stmt->fetch();

        if (!$settings) {
            $settings = [
                'timescale' => 30,
                'daytimestart' => '1899-12-30 08:00:00',
                'daytimeend' => '1899-12-30 17:00:00',
                'workingdays' => '1111111',
            ];
        }

        // fix: Use regex to extract HH:MM — avoids strtotime failure on 1899 dates
        $dayStart = self::extractTime($settings['daytimestart'] ?? '', '08:00');
        $dayEnd = self::extractTime($settings['daytimeend'] ?? '', '17:00');
        $timescale = max(5, (int) ($settings['timescale'] ?? 30));
        $workingdays = $settings['workingdays'] ?? '1111111';
        $weekBegin = (int) ($settings['weekbeginday'] ?? 0); // 0=Mon...6=Sun
        $countdays = (int) ($settings['countdays'] ?? 30);

        $bookingMode = (int)($settings['booking_mode'] ?? 0);
        $modeStr     = $bookingMode === 1 ? 'queue' : 'slots';

        // Check if date is within countdays range
        $today = date('Y-m-d');
        $maxDate = date('Y-m-d', strtotime("+$countdays days"));
        if ($date < $today || $date > $maxDate) {
            Response::success(['booking_mode' => $modeStr, 'date' => $date, 'slots' => [], 'shifts' => [], 'timescale' => $timescale, 'message' => 'Date hors limite']);
            return;
        }

        // Standard date('w') gives 0=Sun...6=Sat
        $w = (int) date('w', strtotime($date));

        // workingdays is fixed index: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
        $dayIndex = ($w + 6) % 7;

        if (strlen($workingdays) > $dayIndex && $workingdays[$dayIndex] === '0') {
            Response::success(['booking_mode' => $modeStr, 'date' => $date, 'slots' => [], 'shifts' => [], 'timescale' => $timescale]);
            return;
        }

        // Check if the patient is already booked on this date with this doctor
        $patientId = trim($_GET['patient_id'] ?? '');
        if (!$patientId) {
            $userSession = AuthMiddleware::authenticate(false);
            if ($userSession && ((int)($userSession['usertype'] ?? -1) === 0)) {
                $pStmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
                $pStmt->execute([$userSession['user_id']]);
                $patientId = $pStmt->fetchColumn() ?: '';
            }
        }

        $existingAppt = null;
        if (!empty($patientId)) {
            $chkStmt = $pdo->prepare("
                SELECT id, token_number, shift_type, estimated_time, apointementdate
                FROM apointements
                WHERE clinicsdoctor_id IN (SELECT id FROM clinicsdoctors WHERE doctor_id = ?)
                  AND DATE(apointementdate) = ?
                  AND patient_id = ?
                  AND status != 1
                LIMIT 1
            ");
            $chkStmt->execute([$doctor_id, $date, $patientId]);
            $existingAppt = $chkStmt->fetch(PDO::FETCH_ASSOC);
        }

        if ($bookingMode === 1) {
            // ── Queue / Numbered booking mode ──────────────────────────
            $shiftMode        = (int)($settings['shift_mode'] ?? 1); // 1 = Single shift, 2 = Double shift
            $morningStart     = self::extractTime($settings['morning_start'] ?? '', '08:30');
            $morningEnd       = self::extractTime($settings['morning_end'] ?? '', '12:30');
            $morningCap       = max(1, (int)($settings['morning_capacity'] ?? 25));
            $eveningStart     = self::extractTime($settings['evening_start'] ?? '', '14:00');
            $eveningEnd       = self::extractTime($settings['evening_end'] ?? '', '17:30');
            $eveningCap       = max(1, (int)($settings['evening_capacity'] ?? 15));
            $allowOverbooking = (int)($settings['allow_overbooking'] ?? 1);

            // Fetch booked count and max token per shift for this doctor & date
            $stmt = $pdo->prepare("
                SELECT shift_type, COUNT(*) as booked_count, COALESCE(MAX(token_number), 0) as max_token
                FROM apointements
                WHERE clinicsdoctor_id IN (
                    SELECT id FROM clinicsdoctors WHERE doctor_id = ?
                )
                  AND DATE(apointementdate) = ?
                  AND status != 1
                GROUP BY shift_type
            ");
            $stmt->execute([$doctor_id, $date]);
            $shiftCounts = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $st = $row['shift_type'] ?: 'morning';
                $shiftCounts[$st] = [
                    'booked_count' => (int)$row['booked_count'],
                    'max_token'    => (int)$row['max_token']
                ];
            }

            $shifts = [];

            // 1. Morning Shift (or Full Day if single shift)
            $mBooked    = ($shiftCounts['full_day']['booked_count'] ?? 0) + ($shiftCounts['morning']['booked_count'] ?? 0);
            $mMaxTok    = max($shiftCounts['full_day']['max_token'] ?? 0, $shiftCounts['morning']['max_token'] ?? 0);
            $mRemaining = max(0, $morningCap - $mBooked);
            $mNextToken = $mMaxTok + 1;

            $mStartMins = (int)substr($morningStart, 0, 2) * 60 + (int)substr($morningStart, 3, 2);
            $mNextMins  = $mStartMins + (($mNextToken - 1) * $timescale);
            $mEstH      = floor($mNextMins / 60) % 24;
            $mEstM      = $mNextMins % 60;
            $mEstTime   = sprintf('%02d:%02d', $mEstH, $mEstM);

            $shifts[] = [
                'shift_type'              => $shiftMode === 1 ? 'full_day' : 'morning',
                'label'                   => $shiftMode === 1 ? 'قائمة اليوم' : 'الفترة الصباحية',
                'start_time'              => $morningStart,
                'end_time'                => $morningEnd,
                'capacity'                => $morningCap,
                'booked_count'            => $mBooked,
                'remaining'               => $mRemaining,
                'is_full'                 => ($mRemaining === 0 && !$allowOverbooking),
                'next_token'              => $mNextToken,
                'estimated_time_for_next' => $mEstTime
            ];

            // 2. Evening Shift (if shiftMode == 2)
            if ($shiftMode === 2) {
                $eBooked    = $shiftCounts['evening']['booked_count'] ?? 0;
                $eMaxTok    = $shiftCounts['evening']['max_token'] ?? 0;
                $eRemaining = max(0, $eveningCap - $eBooked);
                $eNextToken = $eMaxTok + 1;

                $eStartMins = (int)substr($eveningStart, 0, 2) * 60 + (int)substr($eveningStart, 3, 2);
                $eNextMins  = $eStartMins + (($eNextToken - 1) * $timescale);
                $eEstH      = floor($eNextMins / 60) % 24;
                $eEstM      = $eNextMins % 60;
                $eEstTime   = sprintf('%02d:%02d', $eEstH, $eEstM);

                $shifts[] = [
                    'shift_type'              => 'evening',
                    'label'                   => 'الفترة المسائية',
                    'start_time'              => $eveningStart,
                    'end_time'                => $eveningEnd,
                    'capacity'                => $eveningCap,
                    'booked_count'            => $eBooked,
                    'remaining'               => $eRemaining,
                    'is_full'                 => ($eRemaining === 0 && !$allowOverbooking),
                    'next_token'              => $eNextToken,
                    'estimated_time_for_next' => $eEstTime
                ];
            }

            Response::success([
                'booking_mode'         => 'queue',
                'date'                 => $date,
                'timescale'            => $timescale,
                'shift_mode'           => $shiftMode,
                'shifts'               => $shifts,
                'already_booked'       => !empty($existingAppt),
                'existing_appointment' => $existingAppt ?: null,
            ]);
            return;
        }

        $slots = self::buildSlots($date, $dayStart, $dayEnd, $timescale);

        // Remove off-hours (Day in doctorsoffhours: 0=Mon...6=Sun)
        $stmt = $pdo->prepare(
            "SELECT Day, timebegin, timeend FROM doctorsoffhours WHERE doctor_id = ? AND clinic_id = ?"
        );
        $stmt->execute([$doctor_id, $clinicid]);
        $offHours = $stmt->fetchAll();
        $slots = self::filterOffHours($slots, $date, $dayIndex, $offHours);

        // Remove already-booked slots (use new schema: clinicsdoctor_id, status != 0)
        $stmt = $pdo->prepare("
            SELECT apointementdate
            FROM apointements
            WHERE clinicsdoctor_id IN (
                SELECT id FROM clinicsdoctors WHERE doctor_id = ?
            )
              AND DATE(apointementdate) = ?
              AND status != 1
        ");
        $stmt->execute([$doctor_id, $date]);
        $booked = $stmt->fetchAll();

        // Convert booked times to timestamps for easier comparison
        $bookedTimestamps = [];
        foreach ($booked as $r) {
            $ts = strtotime($r['apointementdate'] ?? '');
            if ($ts)
                $bookedTimestamps[] = $ts;
        }

        $currentTime = time();
        $available = array_values(array_filter($slots, function ($s) use ($date, $bookedTimestamps, $timescale, $currentTime) {
            $slotStart = strtotime(trim($date) . ' ' . trim($s) . ':00');
            if (!$slotStart)
                return true; // Should not happen with valid inputs

            // Prevent booking in the past
            if ($slotStart <= $currentTime) {
                return false;
            }

            $slotEnd = $slotStart + ($timescale * 60);

            foreach ($bookedTimestamps as $bt) {
                // If an appointment falls within this slot's duration, the slot is unavailable
                if ($bt >= $slotStart && $bt < $slotEnd) {
                    return false;
                }
            }
            return true;
        }));

        Response::success([
            'booking_mode'         => 'slots',
            'date'                 => $date,
            'slots'                => $available,
            'timescale'            => $timescale,
            'already_booked'       => !empty($existingAppt),
            'existing_appointment' => $existingAppt ?: null,
        ]);
    }

    public static function book(): void
    {
        $session = AuthMiddleware::patientOnly();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        foreach (['clinics_doctor_id', 'date'] as $f) {
            if (empty($data[$f])) {
                Response::error("يرجى تحديد الطبيب والتاريخ لإتمام الحجز.", 422);
            }
        }

        // التحقق من الموافقة الصريحة على معالجة البيانات الصحية (القانون 18-07 المادتين 8 و 9)
        if (empty($data['consent_health'])) {
            Response::error("الموافقة الصريحة على معالجة البيانات الصحية لإتمام حجز الموعد مطلوبة وفقاً للمادتين 8 و 9 من القانون 18-07.", 422);
        }

        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT * FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient)
            Response::notFound('Profil patient introuvable');

        $cdId = $data['clinics_doctor_id'];

        $stmt = $pdo->prepare("SELECT * FROM clinicsdoctors WHERE id = ? LIMIT 1");
        $stmt->execute([$cdId]);
        $cd = $stmt->fetch();
        if (!$cd)
            Response::notFound('Médecin/clinique introuvable (CD)');

        // Verify doctor and clinic are not frozen
        $checkDoc = $pdo->prepare("SELECT is_frozen, freeze_reason FROM doctors WHERE id = ? LIMIT 1");
        $checkDoc->execute([$cd['doctor_id']]);
        $dRow = $checkDoc->fetch();
        if (!empty($dRow['is_frozen'])) {
            Response::error('لا يمكن حجز موعد مع هذا الطبيب حالياً نظراً لتجميد حسابه مؤقتاً.', 403);
        }
        if (!empty($cd['clinic_id'])) {
            $checkCli = $pdo->prepare("SELECT is_frozen FROM clinics WHERE id = ? LIMIT 1");
            $checkCli->execute([$cd['clinic_id']]);
            if ($checkCli->fetchColumn()) {
                Response::error('لا يمكن حجز موعد في هذه العيادة حالياً نظراً لتجميد حسابها مؤقتاً.', 403);
            }
        }

        // Fetch doctor appointment settings to check booking mode
        $settingsStmt = $pdo->prepare("SELECT * FROM doctorssettingapointements WHERE doctor_id = ? AND clinic_id = ? LIMIT 1");
        $settingsStmt->execute([$cd['doctor_id'], $cd['clinic_id']]);
        $settings = $settingsStmt->fetch(PDO::FETCH_ASSOC);
        if (!$settings) {
            $settingsStmt = $pdo->prepare("SELECT * FROM doctorssettingapointements WHERE doctor_id = ? LIMIT 1");
            $settingsStmt->execute([$cd['doctor_id']]);
            $settings = $settingsStmt->fetch(PDO::FETCH_ASSOC);
        }
        $bookingMode = (int)($settings['booking_mode'] ?? 0);

        // Support booking for a family member
        $patientId = $patient['id'];
        $patientname = $patient['fullname'];
        $patientEmail = $patient['email'] ?? '';

        if (!empty($data['patient_id']) && $data['patient_id'] !== $patient['id']) {
            $stmt = $pdo->prepare("SELECT * FROM patientsproches WHERE patient_id = ? AND proche_id = ? LIMIT 1");
            $stmt->execute([$patient['id'], $data['patient_id']]);
            if ($stmt->fetch()) {
                $stmt = $pdo->prepare("SELECT * FROM patients WHERE id = ? LIMIT 1");
                $stmt->execute([$data['patient_id']]);
                $familyMember = $stmt->fetch();
                if ($familyMember) {
                    $patientId = $familyMember['id'];
                    $patientname = $familyMember['fullname'];
                }
            }
        }

        // Validate reason if provided (optional)
        $reasonId = !empty($data['doctors_reason_id']) ? $data['doctors_reason_id'] : null;
        $reasonName = 'consultation';
        if ($reasonId) {
            $stmt = $pdo->prepare(
                "SELECT dr.* FROM doctorsreasons dr
                 JOIN clinicsdoctors cd ON cd.doctor_id = dr.doctor_id
                 WHERE dr.id = ? AND cd.id = ?
                 LIMIT 1"
            );
            $stmt->execute([$reasonId, $cdId]);
            $reasonRow = $stmt->fetch();

            if ($reasonRow) {
                $reasonName = $reasonRow['reason_name'] ?? 'consultation';
            } else {
                $stmt = $pdo->prepare(
                    "SELECT * FROM reasons WHERE id = ? AND specialtie_id = (SELECT specialtie_id FROM clinicsdoctors WHERE id = ? LIMIT 1)"
                );
                $stmt->execute([$reasonId, $cdId]);
                $reasonRow = $stmt->fetch();
                if (!$reasonRow) {
                    Response::notFound('Motif introuvable pour ce médecin');
                }
                $reasonName = $reasonRow['name'] ?? 'consultation';
            }
        }

        // منع المريض من التسجيل في القائمة أو حجز موعد أكثر من مرة في نفس اليوم لنفس الطبيب
        if (!empty($patientId)) {
            $existingApptStmt = $pdo->prepare("
                SELECT id, apointementdate, token_number, shift_type, estimated_time
                FROM apointements
                WHERE clinicsdoctor_id IN (SELECT id FROM clinicsdoctors WHERE doctor_id = ?)
                  AND DATE(apointementdate) = ?
                  AND patient_id = ?
                  AND status != 1
                LIMIT 1
            ");
            $existingApptStmt->execute([$cd['doctor_id'], $data['date'], $patientId]);
        } else {
            $phone = trim($patient['phone'] ?? ($data['phone'] ?? ''));
            $existingApptStmt = $pdo->prepare("
                SELECT id, apointementdate, token_number, shift_type, estimated_time
                FROM apointements
                WHERE clinicsdoctor_id IN (SELECT id FROM clinicsdoctors WHERE doctor_id = ?)
                  AND DATE(apointementdate) = ?
                  AND phone = ? AND phone != ''
                  AND status != 1
                LIMIT 1
            ");
            $existingApptStmt->execute([$cd['doctor_id'], $data['date'], $phone]);
        }
        $existingAppt = $existingApptStmt->fetch(PDO::FETCH_ASSOC);
        if ($existingAppt) {
            if ($bookingMode === 1) {
                $tok = !empty($existingAppt['token_number']) ? " (تذكرتك الحالية رقم #{$existingAppt['token_number']})" : "";
                Response::error("أنت مسجل بالفعل في قائمة الانتظار لهذا اليوم لدى هذا الطبيب{$tok}. لا يمكن التسجيل في القائمة أكثر من مرة في نفس اليوم.", 409);
            } else {
                $timeFormatted = date('H:i', strtotime($existingAppt['apointementdate']));
                Response::error("لديك موعد محجوز بالفعل في هذا اليوم لدى هذا الطبيب (الساعة {$timeFormatted}). لا يمكن حجز أكثر من موعد في نفس اليوم.", 409);
            }
        }

        $tokenNumber   = null;
        $shiftType     = null;
        $estimatedTime = null;
        $isEmergency   = !empty($data['is_emergency']) ? 1 : 0;
        $appointmentId = UUIDHelper::generate();

        if ($bookingMode === 1) {
            // ── Queue / Numbered Mode ──────────────────────────────────
            $shiftMode = (int)($settings['shift_mode'] ?? 1);
            if ($shiftMode === 1) {
                $shiftType = 'full_day';
                $capacity  = max(1, (int)($settings['morning_capacity'] ?? 25));
                $lockQuery = "
                    SELECT COUNT(*) as active_count, COALESCE(MAX(token_number), 0) as max_token
                    FROM apointements
                    WHERE clinicsdoctor_id IN (SELECT id FROM clinicsdoctors WHERE doctor_id = ?)
                      AND DATE(apointementdate) = ?
                      AND (shift_type IN ('full_day', 'morning') OR shift_type IS NULL)
                      AND status != 1
                    FOR UPDATE
                ";
                $lockParams = [$cd['doctor_id'], $data['date']];
            } else {
                $shiftType = (!empty($data['shift_type']) && in_array($data['shift_type'], ['morning', 'evening'])) 
                             ? $data['shift_type'] : 'morning';
                $capacity  = ($shiftType === 'evening') 
                             ? max(1, (int)($settings['evening_capacity'] ?? 15))
                             : max(1, (int)($settings['morning_capacity'] ?? 25));
                $lockQuery = "
                    SELECT COUNT(*) as active_count, COALESCE(MAX(token_number), 0) as max_token
                    FROM apointements
                    WHERE clinicsdoctor_id IN (SELECT id FROM clinicsdoctors WHERE doctor_id = ?)
                      AND DATE(apointementdate) = ?
                      AND shift_type = ?
                      AND status != 1
                    FOR UPDATE
                ";
                $lockParams = [$cd['doctor_id'], $data['date'], $shiftType];
            }

            // Atomic Lock & Number Reservation
            $pdo->beginTransaction();
            $stmt = $pdo->prepare($lockQuery);
            $stmt->execute($lockParams);
            $qInfo = $stmt->fetch(PDO::FETCH_ASSOC);
            $activeCount = (int)($qInfo['active_count'] ?? 0);
            $maxToken    = (int)($qInfo['max_token'] ?? 0);

            if ($activeCount >= $capacity && !$isEmergency) {
                $pdo->rollBack();
                Response::error('عذراً، اكتملت قائمة هذه الفترة بالكامل. يرجى اختيار فترة أخرى أو موعد في يوم آخر.', 409);
            }

            $tokenNumber = $maxToken + 1;
            $timescale = max(5, (int)($settings['timescale'] ?? 15));
            $shiftStart = ($shiftType === 'evening') 
                          ? self::extractTime($settings['evening_start'] ?? '', '14:00') 
                          : self::extractTime($settings['morning_start'] ?? '', '08:30');
            $startMins = (int)substr($shiftStart, 0, 2) * 60 + (int)substr($shiftStart, 3, 2);
            $estMins   = $startMins + (($tokenNumber - 1) * $timescale);
            $estH      = floor($estMins / 60) % 24;
            $estM      = $estMins % 60;
            $estimatedTime = sprintf('%02d:%02d:00', $estH, $estM);
            $appointmentDatetime = $data['date'] . ' ' . $estimatedTime;

            $pdo->prepare("
                INSERT INTO apointements
                    (id, apointementdate, note, patientname, clinicsdoctor_id,
                     reason_id, patient_id, phone, status, consent_health, consent_at, updatedat,
                     token_number, shift_type, estimated_time, is_emergency, queue_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, NOW(), NOW(), ?, ?, ?, ?, 'waiting')
            ")->execute([
                $appointmentId,
                $appointmentDatetime,
                $data['note'] ?? '',
                $patientname,
                $cdId,
                $reasonId,
                $patientId,
                $patient['phone'] ?? '',
                $tokenNumber,
                $shiftType,
                $estimatedTime,
                $isEmergency
            ]);
            $pdo->commit();

        } else {
            // ── Time Slots Mode ────────────────────────────────────────
            if (empty($data['time'])) {
                Response::error("يرجى اختيار وقت الحجز لإتمام الموعد.", 422);
            }
            $time = preg_replace('/[^0-9:]/', '', trim($data['time']));
            if (!preg_match('/^\d{2}:\d{2}$/', $time)) {
                Response::error("صيغة الوقت غير صحيحة. يرجى اختيار وقت الحجز من الخيارات المتاحة.", 422);
            }

            $appointmentDatetime = $data['date'] . ' ' . $time . ':00';

            if (strtotime($appointmentDatetime) <= time()) {
                Response::error('لا يمكن حجز موعد في وقت أو تاريخ سابق.', 422);
            }

            // Check for double-booking
            $stmt = $pdo->prepare("
                SELECT COUNT(*) FROM apointements
                WHERE clinicsdoctor_id IN (SELECT id FROM clinicsdoctors WHERE doctor_id = ?)
                  AND apointementdate = ?
                  AND status != 1
            ");
            $stmt->execute([$cd['doctor_id'], $appointmentDatetime]);
            if ($stmt->fetchColumn() > 0) {
                Response::error('هذا الوقت محجوز بالفعل لدى الطبيب. يرجى اختيار وقت آخر.', 409);
            }

            $pdo->prepare("
                INSERT INTO apointements
                    (id, apointementdate, note, patientname, clinicsdoctor_id,
                     reason_id, patient_id, phone, status, consent_health, consent_at, updatedat,
                     token_number, shift_type, estimated_time, is_emergency, queue_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, NOW(), NOW(), NULL, NULL, NULL, 0, 'waiting')
            ")->execute([
                $appointmentId,
                $appointmentDatetime,
                $data['note'] ?? '',
                $patientname,
                $cdId,
                $reasonId,
                $patientId,
                $patient['phone'] ?? ''
            ]);
        }

        // تسجيل الموافقة على البيانات الصحية في consent_logs وفقاً للقانون 18-07
        require_once __DIR__ . '/../helpers/ConsentHelper.php';
        try {
            ConsentHelper::log(
                $pdo,
                $session['user_id'],
                $patientId,
                ConsentHelper::TYPE_HEALTH_DATA,
                1,
                'appointment'
            );
        } catch (Throwable $e) {
            error_log('Consent logging error (appointment): ' . $e->getMessage());
        }

        // إرسال تنبيه للطبيب والعيادة والمريض عند حجز موعد جديد
        require_once __DIR__ . '/../helpers/NotificationHelper.php';
        try {
            $stmt = $pdo->prepare("
                SELECT d.user_id as doctor_user_id, d.fullname as doctor_fullname,
                       c.user_id as clinic_user_id, c.clinicname
                FROM clinicsdoctors cd
                JOIN doctors d ON d.id = cd.doctor_id
                LEFT JOIN clinics c ON c.id = cd.clinic_id
                WHERE cd.id = ?
                LIMIT 1
            ");
            $stmt->execute([$cdId]);
            $associated = $stmt->fetch();
            if ($associated) {
                $formattedDate = date('Y-m-d H:i', strtotime($appointmentDatetime));

                // تنبيه الطبيب: موعد جديد محجوز
                $msgDoctor = "تم حجز موعد جديد من قبل المريض: $patientname بتاريخ $formattedDate";
                NotificationHelper::notify($associated['doctor_user_id'], "حجز موعد جديد", $msgDoctor, "appointment");

                // تنبيه العيادة إن وجدت
                if (!empty($associated['clinic_user_id'])) {
                    NotificationHelper::notify($associated['clinic_user_id'], "حجز موعد جديد", $msgDoctor, "appointment");
                }

                // تنبيه المريض: تأكيد حجز موعده
                $doctorName = $associated['doctor_fullname'] ?? 'الطبيب';
                $clinicName = $associated['clinicname'] ?? '';
                $msgPatient = "تم تأكيد حجز موعدك مع الطبيب: $doctorName" . ($clinicName ? " في $clinicName" : "") . " بتاريخ $formattedDate";
                NotificationHelper::notify($session['user_id'], "تأكيد حجز الموعد", $msgPatient, "appointment");
            }
        } catch (Throwable $e) {
            error_log("Failed to send booking notifications: " . $e->getMessage());
        }

        $stmt = $pdo->prepare("SELECT fullname FROM doctors WHERE id = ? LIMIT 1");
        $stmt->execute([$cd['doctor_id']]);
        $doctor = $stmt->fetch();

        $stmt = $pdo->prepare("SELECT clinicname FROM clinics WHERE id = ? LIMIT 1");
        $stmt->execute([$cd['clinic_id']]);
        $clinic = $stmt->fetch();

        if (!empty($patientEmail)) {
            @EmailHelper::sendAppointmentConfirmation(
                $patientEmail,
                $patient['fullname'],
                $doctor['fullname'] ?? 'Médecin',
                $clinic['clinicname'] ?? 'clinique',
                $appointmentDatetime
            );
        }

        Response::success([
            'appointment_id' => $appointmentId,
            'date'           => $appointmentDatetime,
            'token_number'   => $tokenNumber,
            'shift_type'     => $shiftType,
            'estimated_time' => !empty($estimatedTime) ? substr($estimatedTime, 0, 5) : null,
            'reason'         => $reasonName,
            'patient_name'   => $patientname,
        ], 'Rendez-vous confirmé! email de confirmation envoyé.', 201);
    }

    public static function getOne(string $id): void
    {
        $session = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT a.*,
                   d.fullname as doctorname, d.id as doctor_id,
                   c.clinicname, c.address as ClinicAddress, c.id as clinicid,
                   COALESCE(dr.reason_name, r.name) as ReasonName,
                   s.namefr as specialtyfr
            FROM apointements a
            LEFT JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
            LEFT JOIN doctors d         ON d.id = cd.doctor_id
            LEFT JOIN clinics c         ON c.id = cd.clinic_id
            LEFT JOIN doctorsreasons dr ON dr.id = a.reason_id
            LEFT JOIN reasons r         ON r.id = a.reason_id
            LEFT JOIN specialties s     ON s.id = cd.specialtie_id
            WHERE a.id = ?
        ");
        $stmt->execute([$id]);
        $appt = $stmt->fetch();
        if (!$appt)
            Response::notFound();

        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient || $appt['patient_id'] !== $patient['id'])
            Response::error('Accès interdit', 403);

        Response::success($appt);
    }

    public static function cancel(string $id): void
    {
        $session = AuthMiddleware::patientOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient)
            Response::notFound();

        $stmt = $pdo->prepare("
            SELECT * FROM apointements 
            WHERE id = ? 
              AND (patient_id = ? OR patient_id IN (SELECT proche_id FROM patientsproches WHERE patient_id = ?))
            LIMIT 1
        ");
        $stmt->execute([$id, $patient['id'], $patient['id']]);
        $appt = $stmt->fetch();
        if (!$appt)
            Response::notFound('Rendez-vous non trouvé');

        if (strtotime($appt['apointementdate']) < time())
            Response::error("Impossible d'annuler un rendez-vous passé", 400);

        // إشعار الطبيب والعيادة والمريض عند إلغاء الموعد
        require_once __DIR__ . '/../helpers/NotificationHelper.php';
        try {
            $stmt = $pdo->prepare("
                SELECT d.user_id as doctor_user_id, d.fullname as doctor_fullname,
                       c.user_id as clinic_user_id, a.apointementdate, a.patientname
                FROM apointements a
                JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
                JOIN doctors d ON d.id = cd.doctor_id
                LEFT JOIN clinics c ON c.id = cd.clinic_id
                WHERE a.id = ?
                LIMIT 1
            ");
            $stmt->execute([$id]);
            $associated = $stmt->fetch();
            if ($associated) {
                $formattedDate = date('Y-m-d H:i', strtotime($associated['apointementdate']));

                // تنبيه الطبيب بالإلغاء
                $msgDoctor = "تم إلغاء الموعد من طرف المريض: " . $associated['patientname'] . " الذي كان مقرراً بتاريخ $formattedDate";
                NotificationHelper::notify($associated['doctor_user_id'], "إلغاء موعد", $msgDoctor, "appointment");

                // تنبيه العيادة بالإلغاء إن وجدت
                if (!empty($associated['clinic_user_id'])) {
                    NotificationHelper::notify($associated['clinic_user_id'], "إلغاء موعد", $msgDoctor, "appointment");
                }

                // تنبيه المريض بتأكيد إلغاء موعده
                $doctorName = $associated['doctor_fullname'] ?? 'الطبيب';
                $msgPatient = "تم إلغاء موعدك مع الطبيب: $doctorName الذي كان مقرراً بتاريخ $formattedDate بنجاح.";
                NotificationHelper::notify($session['user_id'], "تأكيد إلغاء الموعد", $msgPatient, "appointment");
            }
        } catch (Throwable $e) {
            error_log("Failed to send cancel notification: " . $e->getMessage());
        }

        // Soft delete: status = 1 = annulé
        $pdo->prepare("
            UPDATE apointements SET status = 1, updatedat = NOW() WHERE id = ?
        ")->execute([$id]);

        $stmt = $pdo->prepare("SELECT * FROM patients WHERE id = ? LIMIT 1");
        $stmt->execute([$patient['id']]);
        $pd = $stmt->fetch();
        if (!empty($pd['email'])) {
            @EmailHelper::sendAppointmentCancellation(
                $pd['email'],
                $pd['fullname'],
                $appt['apointementdate']
            );
        }
        Response::success(null, 'Rendez-vous annulé');
    }


    // ── Delphi Sync — Delta Sync (مزامنة تفاضلية) ──────────────────

    // POST /api/apointements/sync
    // Headers: Authorization: Bearer <doctor_token> 
    // Returns: { success, data: [...delta appointments...], SyncDate }
    // ────────────────────────────────────────────────────────────────

    public static function sync(): void
    {
        $session = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();

        // ── Resolve doctor_id ────────────────────────────────────
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctorRow = $stmt->fetch();
        if (!$doctorRow)
            Response::error('Médecin introuvable', 404);
        $doctor_id = $doctorRow['id'];

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $clinic_id = trim($data['clinic_id'] ?? '');
        $last_sync_date = trim($data['last_sync_date'] ?? '');
        if (!$clinic_id)
            Response::error('clinic_id requis', 422);


        // ── Resolve clinicsdoctors.id ────────────────────────────
        $stmt = $pdo->prepare(
            "SELECT id FROM clinicsdoctors WHERE doctor_id = ? AND clinic_id = ? LIMIT 1"
        );
        $stmt->execute([$doctor_id, $clinic_id]);
        $cdRow = $stmt->fetch();
        if (!$cdRow)
            Response::error('Relation médecin-clinique introuvable', 403);
        $clinicsdoctor_id = $cdRow['id'];

        // ── DOWNLOAD PHASE ─────────────────────────────────────────   
        // ── GET NEW appointments (since last sync) ───────────────
        $lastSyncDb = $last_sync_date ?: date('Y-m-d H:i:s', strtotime('-1 year'));
        $stmt = $pdo->prepare("
            SELECT a.*
            FROM apointements a
            WHERE a.clinicsdoctor_id = ?
              AND a.updatedat > ?
            ORDER BY a.apointementdate ASC
        ");
        $stmt->execute([$clinicsdoctor_id, $lastSyncDb]);
        $downloadItems = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // ── UPLOAD PHASE ─────────────────────────────────────────        
        $uploadItems = $data['appointments'] ?? [];
        foreach ($uploadItems as $item) {
            $id = trim($item['id'] ?? '');
            if (!$id)
                continue;

            $apointementdate = $item['apointementdate'] ?? null;
            $patientname = $item['fullname'] ?? '';
            $phone = $item['phone'] ?? '';
            $reason_id = ($item['reason_id'] ?? '') !== '' ? $item['reason_id'] : null;
            $notes = $item['note'] ?? '';
            $status = (int) ($item['status'] ?? 2);
            $apointementcolor = (int) ($item['apointementcolor'] ?? 13952740);

            // UpdatedAt sent by Delphi — used as the record timestamp
            $delphiUpdatedAt = date('Y-m-d H:i:s');

            // Check if record exists and fetch its current UpdatedAt
            $chk = $pdo->prepare(
                "SELECT id FROM apointements WHERE id = ? LIMIT 1"
            );
            $chk->execute([$id]);
            $existing = $chk->fetch();

            if ($existing) {
                $pdo->prepare("
                        UPDATE apointements
                        SET apointementdate = ?, patientname = ?, phone = ?,
                            reason_id = ?, note = ?, status = ?,
                            apointementcolor = ?, updatedat = ?
                        WHERE id = ?
                    ")->execute([
                            $apointementdate,
                            $patientname,
                            $phone,
                            $reason_id,
                            $notes,
                            $status,
                            $apointementcolor,
                            $delphiUpdatedAt,
                            $id
                        ]);
            } else {
                // New record from Delphi — insert it
                $pdo->prepare("
                    INSERT INTO apointements
                        (id, clinicsdoctor_id, apointementdate, patientname, phone,
                         reason_id, note, status, apointementcolor, updatedat)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ")->execute([
                            $id,
                            $clinicsdoctor_id,
                            $apointementdate,
                            $patientname,
                            $phone,
                            $reason_id,
                            $notes,
                            $status,
                            $apointementcolor,
                            $delphiUpdatedAt
                        ]);
            }
        }

        // SyncDate = now — Delphi must store this as the new LastSyncDate
        $syncDate = date('Y-m-d H:i:s');
        echo json_encode([
            'success' => true,
            'sync_date' => $syncDate,
            'data' => $downloadItems,
        ]);
        exit;
    }

    // ── Private Helpers ─────────────────────────────────────────
    private static function extractTime(string $dt, string $fallback = '08:00'): string
    {
        if (preg_match('/(\d{2}:\d{2})/', $dt, $m))
            return $m[1];
        return $fallback;
    }

    private static function buildSlots(string $date, string $start, string $end, int $step): array
    {
        $slots = [];
        $current = strtotime("$date $start:00");
        $endTs = strtotime("$date $end:00");
        if (!$current || !$endTs || $endTs <= $current)
            return $slots;
        while ($current < $endTs) {
            $slots[] = date('H:i', $current);
            $current += $step * 60;
        }
        return $slots;
    }

    private static function filterOffHours(array $slots, string $date, int $dayOfWeek, array $offHours): array
    {
        return array_filter($slots, function ($slot) use ($date, $dayOfWeek, $offHours) {
            $slotTs = strtotime("$date $slot:00");
            foreach ($offHours as $oh) {
                if ((int) $oh['Day'] !== $dayOfWeek)
                    continue;
                $s = self::extractTime($oh['timebegin'] ?? '', '');
                $e = self::extractTime($oh['timeend'] ?? '', '');
                if (!$s || !$e)
                    continue;
                $os = strtotime("$date $s:00");
                $oe = strtotime("$date $e:00");
                if ($slotTs >= $os && $slotTs < $oe)
                    return false;
            }
            return true;
        });
    }
}
