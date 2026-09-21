<?php
// ============================================================
// controllers/ClinicAppointmentController.php
// Centralized Multi-Doctor Appointment Management for Clinics (user_type = 2)
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';

class ClinicAppointmentController
{
    /**
     * Resolve the clinic ID from the authenticated session.
     */
    private static function getAuthenticatedClinic(array $session, PDO $pdo): array
    {
        $stmt = $pdo->prepare("SELECT id, clinicname, phone, email, address FROM clinics WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $clinic = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$clinic) {
            Response::error('الملف الخاص بالعيادة غير موجود. يرجى التواصل مع الإدارة.', 404);
        }
        return $clinic;
    }

    /**
     * GET /api/clinic/doctors
     * Returns all accepted/affiliated doctors for this clinic.
     */
    public static function getDoctors(): void
    {
        $session = AuthMiddleware::clinicOnly();
        $pdo = Database::getInstance();
        $clinic = self::getAuthenticatedClinic($session, $pdo);
        $clinicId = $clinic['id'];

        $stmt = $pdo->prepare("
            SELECT 
                d.id AS doctor_id,
                d.fullname AS doctor_name,
                d.phone AS doctor_phone,
                d.email AS doctor_email,
                d.pricing,
                COALESCE(s.namear, s.namefr, '') AS specialty_name,
                s.namefr AS specialty_fr,
                s.namear AS specialty_ar,
                cd.id AS clinicsdoctor_id,
                cd.status AS relation_status,
                CASE WHEN d.photoprofile IS NOT NULL AND LENGTH(d.photoprofile) > 0 THEN 1 ELSE 0 END AS has_photo,
                (
                    SELECT COUNT(*) 
                    FROM apointements a 
                    WHERE a.clinicsdoctor_id = cd.id 
                      AND DATE(a.apointementdate) = CURDATE() 
                      AND a.status != 1
                ) AS today_appts_count
            FROM clinicsdoctors cd
            JOIN doctors d ON d.id = cd.doctor_id
            LEFT JOIN specialties s ON s.id = cd.specialtie_id
            WHERE cd.clinic_id = ? 
              AND UPPER(cd.status) IN ('APPROVED', 'ACCEPTED')
            ORDER BY d.fullname ASC
        ");
        $stmt->execute([$clinicId]);
        $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success([
            'clinic'  => $clinic,
            'doctors' => $doctors
        ]);
    }

    /**
     * GET /api/clinic/appointments
     * Returns appointments for the clinic with optional filters:
     * - doctor_id (optional, UUID or 'all')
     * - from (YYYY-MM-DD)
     * - to (YYYY-MM-DD)
     * - status (0=pending, 1=cancelled, 2=confirmed, 3=completed, 4=arrived)
     * - q / search (patient name or phone)
     */
    public static function getAppointments(): void
    {
        $session = AuthMiddleware::clinicOnly();
        $pdo = Database::getInstance();
        $clinic = self::getAuthenticatedClinic($session, $pdo);
        $clinicId = $clinic['id'];

        $where = ["cd.clinic_id = ?", "UPPER(cd.status) IN ('APPROVED', 'ACCEPTED')"];
        $params = [$clinicId];

        // Filter by doctor
        $doctorId = trim($_GET['doctor_id'] ?? '');
        if ($doctorId && $doctorId !== 'all') {
            $where[] = "cd.doctor_id = ?";
            $params[] = $doctorId;
        }

        // Date range
        $from = trim($_GET['from'] ?? '');
        $to   = trim($_GET['to'] ?? '');
        if ($from) {
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) {
                $where[] = "DATE(a.apointementdate) >= ?";
                $params[] = $from;
            }
        }
        if ($to) {
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)) {
                $where[] = "DATE(a.apointementdate) <= ?";
                $params[] = $to;
            }
        }

        // Status filter
        if (isset($_GET['status']) && $_GET['status'] !== '' && $_GET['status'] !== 'all') {
            $where[] = "a.status = ?";
            $params[] = (int)$_GET['status'];
        }

        // Search query
        $search = trim($_GET['q'] ?? $_GET['search'] ?? '');
        if ($search) {
            $where[] = "(COALESCE(p.fullname, a.patientname) LIKE ? OR COALESCE(p.phone, a.phone) LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $whereSQL = implode(' AND ', $where);

        $stmt = $pdo->prepare("
            SELECT 
                a.id,
                a.apointementdate,
                a.status,
                a.note,
                a.updatedat,
                a.apointementcolor,
                a.clinicsdoctor_id,
                a.patient_id,
                COALESCE(p.fullname, a.patientname) AS patientname,
                COALESCE(p.phone, a.phone)         AS phone,
                COALESCE(dr.reason_name, r.name, '') AS reason_name,
                d.id                                AS doctor_id,
                d.fullname                          AS doctorname,
                COALESCE(s.namear, s.namefr, '') AS specialty_name,
                c.clinicname,
                cd.clinic_id
            FROM apointements a
            JOIN clinicsdoctors cd         ON cd.id = a.clinicsdoctor_id
            JOIN doctors d                 ON d.id  = cd.doctor_id
            JOIN clinics c                 ON c.id  = cd.clinic_id
            LEFT JOIN specialties s        ON s.id  = cd.specialtie_id
            LEFT JOIN patients p           ON p.id  = a.patient_id
            LEFT JOIN doctorsreasons dr    ON dr.id = a.reason_id
            LEFT JOIN reasons r            ON r.id  = a.reason_id
            WHERE {$whereSQL}
            ORDER BY a.apointementdate ASC
        ");
        $stmt->execute($params);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success([
            'clinic'       => $clinic,
            'appointments' => $appointments
        ]);
    }

    /**
     * POST /api/clinic/appointments/book
     * Desk/Counter booking for an in-person or phone patient.
     */
    public static function bookAppointment(): void
    {
        $session = AuthMiddleware::clinicOnly();
        $pdo = Database::getInstance();
        $clinic = self::getAuthenticatedClinic($session, $pdo);
        $clinicId = $clinic['id'];

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $clinicsdoctorId = trim($data['clinics_doctor_id'] ?? '');
        $date            = trim($data['date'] ?? '');
        $time            = trim($data['time'] ?? '');
        $patientname     = trim($data['patientname'] ?? '');
        $phone           = trim($data['phone'] ?? '');
        $note            = trim($data['note'] ?? '');
        $reasonId        = !empty($data['reason_id']) ? $data['reason_id'] : null;
        $color           = (int)($data['apointementcolor'] ?? 0);

        if (!$clinicsdoctorId || !$date || !$time || !$patientname) {
            Response::error('يرجى تحديد الطبيب، التاريخ، الوقت، واسم المريض.', 422);
        }

        // Verify the clinicsdoctor belongs to this clinic and is accepted
        $stmt = $pdo->prepare("
            SELECT id, doctor_id 
            FROM clinicsdoctors 
            WHERE id = ? AND clinic_id = ? AND UPPER(status) IN ('APPROVED', 'ACCEPTED') 
            LIMIT 1
        ");
        $stmt->execute([$clinicsdoctorId, $clinicId]);
        $cd = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$cd) {
            Response::error('هذا الطبيب غير مرتبط بهذه العيادة أو أن طلب الارتباط لم يُعتمد بعد.', 403);
        }

        $appointmentDatetime = $date . ' ' . preg_replace('/[^0-9:]/', '', $time) . ':00';
        if (strtotime($appointmentDatetime) <= time()) {
            Response::error('لا يمكن حجز موعد في وقت أو تاريخ سابق.', 422);
        }

        $appointmentId = UUIDHelper::generate();

        $stmt = $pdo->prepare("
            INSERT INTO apointements
                (id, clinicsdoctor_id, apointementdate, patientname, phone, reason_id,
                 note, status, apointementcolor, updatedat)
            VALUES (?, ?, ?, ?, ?, ?, ?, 2, ?, NOW())
        ");
        $stmt->execute([
            $appointmentId,
            $clinicsdoctorId,
            $appointmentDatetime,
            $patientname,
            $phone,
            $reasonId,
            $note,
            $color
        ]);

        Response::success([
            'appointment_id' => $appointmentId,
            'datetime'       => $appointmentDatetime
        ], 'تم تسجيل الموعد بنجاح', 201);
    }

    /**
     * PUT /api/clinic/appointments/:id/status
     * Updates the status of an appointment belonging to this clinic.
     */
    public static function updateStatus(string $appointmentId): void
    {
        $session = AuthMiddleware::clinicOnly();
        $pdo = Database::getInstance();
        $clinic = self::getAuthenticatedClinic($session, $pdo);
        $clinicId = $clinic['id'];

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!isset($data['status'])) {
            Response::error('الحالة المطلوبة (status) غير محددة.', 422);
        }

        $newStatus = (int)$data['status'];
        $allowedStatuses = [0, 1, 2, 3, 4]; // 0=Pending, 1=Cancelled, 2=Confirmed, 3=Completed, 4=Arrived
        if (!in_array($newStatus, $allowedStatuses, true)) {
            Response::error('قيمة الحالة غير صالحة.', 422);
        }

        // Verify this appointment belongs to this clinic
        $stmt = $pdo->prepare("
            SELECT a.id, a.status, cd.clinic_id
            FROM apointements a
            JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
            WHERE a.id = ? AND cd.clinic_id = ?
            LIMIT 1
        ");
        $stmt->execute([$appointmentId, $clinicId]);
        $appt = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$appt) {
            Response::error('الموعد غير موجود أو لا يتبع لهذه العيادة.', 403);
        }

        $note = isset($data['note']) ? trim($data['note']) : null;

        if ($note !== null) {
            $stmt = $pdo->prepare("UPDATE apointements SET status = ?, note = ?, updatedat = NOW() WHERE id = ?");
            $stmt->execute([$newStatus, $note, $appointmentId]);
        } else {
            $stmt = $pdo->prepare("UPDATE apointements SET status = ?, updatedat = NOW() WHERE id = ?");
            $stmt->execute([$newStatus, $appointmentId]);
        }

        Response::success([
            'appointment_id' => $appointmentId,
            'status'         => $newStatus
        ], 'تم تحديث حالة الموعد بنجاح');
    }
}
