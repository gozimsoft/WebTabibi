<?php
// ============================================================
// controllers/AppointmentController.php  — FIXED v2
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';
require_once __DIR__ . '/../helpers/EmailHelper.php';

class AppointmentController {

    public static function getAvailableSlots(): void {
        $cdId = trim($_GET['clinics_doctor_id'] ?? '');
        $date = trim($_GET['date'] ?? '');

        if (!$cdId || !$date)
            Response::error('clinics_doctor_id et date sont requis', 422);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date))
            Response::error('Format de date invalide (YYYY-MM-DD)', 422);

        $pdo  = Database::getInstance();

        $stmt = $pdo->prepare("SELECT * FROM clinicsdoctors WHERE id = ? LIMIT 1");
        $stmt->execute([$cdId]);
        $cd   = $stmt->fetch();
        if (!$cd) Response::notFound('Médecin/clinique introuvable');

        $doctor_id = $cd['doctor_id'];
        $clinicid = $cd['clinic_id'];

        $stmt = $pdo->prepare(
            "SELECT * FROM doctorssettingapointements WHERE doctor_id = ? AND clinic_id = ? LIMIT 1"
        );
        $stmt->execute([$doctor_id, $clinicid]);
        $settings = $stmt->fetch();

        if (!$settings) {
            $settings = [
                'timescale'    => 30,
                'daytimestart' => '1899-12-30 08:00:00',
                'daytimeend'   => '1899-12-30 17:00:00',
                'workingdays'  => '1111111',
            ];
        }

        // fix: Use regex to extract HH:MM — avoids strtotime failure on 1899 dates
        $dayStart    = self::extractTime($settings['daytimestart'] ?? '', '08:00');
        $dayEnd      = self::extractTime($settings['daytimeend']   ?? '', '17:00');
        $timescale   = max(5, (int)($settings['timescale'] ?? 30));
        $workingdays = $settings['workingdays'] ?? '1111111';
        $weekBegin   = (int)($settings['weekbeginday'] ?? 0); // 0=Mon...6=Sun
        $countdays   = (int)($settings['countdays'] ?? 30);

        // Check if date is within countdays range
        $today = date('Y-m-d');
        $maxDate = date('Y-m-d', strtotime("+$countdays days"));
        if ($date < $today || $date > $maxDate) {
            Response::success(['date' => $date, 'slots' => [], 'timescale' => $timescale, 'message' => 'Date hors limite']);
            return;
        }

        // Standard date('w') gives 0=Sun...6=Sat
        $w = (int)date('w', strtotime($date));
        
        // Map user's weekbeginday (0=Mon...6=Sun) to Standard (0=Sun...6=Sat)
        // 0=Mon -> 1, 1=Tue -> 2, ..., 5=Sat -> 6, 6=Sun -> 0
        $stdWBD = ($weekBegin + 1) % 7;
        
        // Calculate relative index in workingdays array
        $relIndex = ($w - $stdWBD + 7) % 7;

        if (strlen($workingdays) > $relIndex && $workingdays[$relIndex] === '0') {
            Response::success(['date' => $date, 'slots' => [], 'timescale' => $timescale]);
            return;
        }

        $slots = self::buildSlots($date, $dayStart, $dayEnd, $timescale);

        // Remove off-hours
        $stmt = $pdo->prepare(
            "SELECT Day, timebegin, timeend FROM doctorsoffhours WHERE doctor_id = ? AND clinic_id = ?"
        );
        $stmt->execute([$doctor_id, $clinicid]);
        $offHours = $stmt->fetchAll();
        $slots    = self::filterOffHours($slots, $date, $relIndex, $offHours);

        // Remove already-booked (across ALL clinics for this doctor)
        $stmt = $pdo->prepare("
            SELECT appointementdate 
            FROM apointements 
            WHERE (clinicsdoctor_id IN (SELECT id FROM clinicsdoctors WHERE doctor_id = ?) OR doctor_id = ?)
              AND DATE(appointementdate) = ?
              AND isdelete = 0
        ");
        $stmt->execute([$doctor_id, $doctor_id, $date]);
        $booked = $stmt->fetchAll();
        
        // Convert booked times to timestamps for easier comparison
        $bookedTimestamps = [];
        foreach ($booked as $r) {
            $ts = strtotime($r['appointementdate'] ?? '');
            if ($ts) $bookedTimestamps[] = $ts;
        }

        $available = array_values(array_filter($slots, function($s) use ($date, $bookedTimestamps, $timescale) {
            $slotStart = strtotime(trim($date) . ' ' . trim($s) . ':00');
            if (!$slotStart) return true; // Should not happen with valid inputs
            
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
            'date'      => $date,
            'slots'     => $available,
            'timescale' => $timescale,
            'debug'     => [
                'total_slots' => count($slots),
                'booked_found' => count($booked),
                'available_count' => count($available)
            ]
        ]);
    }

    public static function book(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];

        foreach (['clinics_doctor_id','date','time'] as $f) {
            if (empty($data[$f])) Response::error("Le champ '$f' est requis", 422);
        }

        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT * FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('Profil patient introuvable');

        $cdId = $data['clinics_doctor_id'];

        $stmt = $pdo->prepare("SELECT * FROM clinicsdoctors WHERE id = ? LIMIT 1");
        $stmt->execute([$cdId]);
        $cd = $stmt->fetch();
        if (!$cd) Response::notFound('Médecin/clinique introuvable (CD)');

        // Support booking for a family member
        $patientId    = $patient['id'];
        $patientname  = $patient['fullname'];
        $patientEmail = $patient['email'] ?? '';

        if (!empty($data['patient_id']) && $data['patient_id'] !== $patient['id']) {
            $stmt = $pdo->prepare("SELECT * FROM patientsproches WHERE patient_id = ? AND proche_id = ? LIMIT 1");
            $stmt->execute([$patient['id'], $data['patient_id']]);
            if ($stmt->fetch()) {
                $stmt = $pdo->prepare("SELECT * FROM patients WHERE id = ? LIMIT 1");
                $stmt->execute([$data['patient_id']]);
                $familyMember = $stmt->fetch();
                if ($familyMember) {
                    $patientId   = $familyMember['id'];
                    $patientname = $familyMember['fullname'];
                }
            }
        }

        // Validate reason if provided (optional)
        $reasonId   = !empty($data['doctors_reason_id']) ? $data['doctors_reason_id'] : null;
        $reasonName = 'consultation';
        if ($reasonId) {
            $stmt = $pdo->prepare(
                "SELECT * FROM doctorsreasons WHERE id = ? AND doctor_id = ? AND clinic_id = ? LIMIT 1"
            );
            $stmt->execute([$reasonId, $cd['doctor_id'], $cd['clinic_id']]);
            $reasonRow = $stmt->fetch();
            if (!$reasonRow) Response::notFound('Motif introuvable pour ce médecin');
            $reasonName = $reasonRow['reason_name'] ?? 'consultation';
        }

        $time = preg_replace('/[^0-9:]/', '', trim($data['time']));
        if (!preg_match('/^\d{2}:\d{2}$/', $time))
            Response::error("Format d'heure invalide. Attendu HH:MM", 422);

        $appointmentDatetime = $data['date'] . ' ' . $time . ':00';

        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM apointements 
            WHERE (clinicsdoctor_id IN (SELECT id FROM clinicsdoctors WHERE doctor_id = ?) OR doctor_id = ?)
              AND appointementdate = ?
              AND isdelete = 0
        ");
        $stmt->execute([$cd['doctor_id'], $cd['doctor_id'], $appointmentDatetime]);
        if ($stmt->fetchColumn() > 0)
            Response::error('هذا الوقت محجوز بالفعل لدى الطبيب. يرجى اختيار وقت آخر.', 409);

        $appointmentId = UUIDHelper::generate();
        $pdo->prepare(
            "INSERT INTO apointements (id, appointementdate, note, patientname, clinicsdoctor_id, doctorsreason_id, patient_id, doctor_id, source)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'web')"
        )->execute([
            $appointmentId, $appointmentDatetime,
            $data['note'] ?? '', $patientname,
            $cdId, $reasonId, $patientId,
            $cd['doctor_id']
        ]);

        $stmt = $pdo->prepare("SELECT fullname FROM doctors WHERE id = ? LIMIT 1");
        $stmt->execute([$cd['doctor_id']]);
        $doctor = $stmt->fetch();

        $stmt = $pdo->prepare("SELECT clinicname FROM clinics WHERE id = ? LIMIT 1");
        $stmt->execute([$cd['clinic_id']]);
        $clinic = $stmt->fetch();

        if (!empty($patientEmail)) {
            @EmailHelper::sendAppointmentConfirmation(
                $patientEmail, $patient['fullname'],
                $doctor['fullname'] ?? 'Médecin',
                $clinic['clinicname'] ?? 'clinique',
                $appointmentDatetime,
                $reasonName
            );
        }

        Response::success([
            'appointment_id' => $appointmentId,
            'date'           => $appointmentDatetime,
            'reason'         => $reasonName,
            'patient_name'   => $patientname,
        ], 'Rendez-vous confirmé! email de confirmation envoyé.', 201);
    }

    public static function getOne(string $id): void {
        $session = AuthMiddleware::authenticate();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT a.*,
                   d.fullname as doctorname, d.id as doctor_id,
                   c.clinicname, c.address as ClinicAddress, c.id as clinicid,
                   dr.reason_name as ReasonName,
                   s.namefr as specialtyfr
            FROM apointements a
            LEFT JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
            LEFT JOIN doctors d         ON d.id = cd.doctor_id
            LEFT JOIN clinics c         ON c.id = cd.clinic_id
            LEFT JOIN doctorsreasons dr ON dr.id = a.doctorsreason_id
            LEFT JOIN specialties s     ON s.id = cd.specialtie_id
            WHERE a.id = ?
        ");
        $stmt->execute([$id]);
        $appt = $stmt->fetch();
        if (!$appt) Response::notFound();

        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient || $appt['patient_id'] !== $patient['id'])
            Response::error('Accès interdit', 403);

        Response::success($appt);
    }

    public static function cancel(string $id): void {
        $session = AuthMiddleware::patientOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound();

        $stmt = $pdo->prepare("SELECT * FROM apointements WHERE id = ? AND patient_id = ? LIMIT 1");
        $stmt->execute([$id, $patient['id']]);
        $appt = $stmt->fetch();
        if (!$appt) Response::notFound('Rendez-vous non trouvé');

        if (strtotime($appt['appointementdate']) < time())
            Response::error("Impossible d'annuler un rendez-vous passé", 400);

        $pdo->prepare("DELETE FROM apointements WHERE id = ?")->execute([$id]);

        $stmt = $pdo->prepare("SELECT * FROM patients WHERE id = ? LIMIT 1");
        $stmt->execute([$patient['id']]);
        $pd = $stmt->fetch();
        if (!empty($pd['email'])) {
            @EmailHelper::sendAppointmentCancellation(
                $pd['email'], $pd['fullname'], $appt['appointementdate']
            );
        }
        Response::success(null, 'Rendez-vous annulé');
    }

    // ── Private Helpers ─────────────────────────────────────────
    private static function extractTime(string $dt, string $fallback = '08:00'): string {
        if (preg_match('/(\d{2}:\d{2})/', $dt, $m)) return $m[1];
        return $fallback;
    }

    private static function buildSlots(string $date, string $start, string $end, int $step): array {
        $slots   = [];
        $current = strtotime("$date $start:00");
        $endTs   = strtotime("$date $end:00");
        if (!$current || !$endTs || $endTs <= $current) return $slots;
        while ($current < $endTs) {
            $slots[] = date('H:i', $current);
            $current += $step * 60;
        }
        return $slots;
    }

    private static function filterOffHours(array $slots, string $date, int $dayOfWeek, array $offHours): array {
        return array_filter($slots, function ($slot) use ($date, $dayOfWeek, $offHours) {
            $slotTs = strtotime("$date $slot:00");
            foreach ($offHours as $oh) {
                if ((int)$oh['Day'] !== $dayOfWeek) continue;
                $s = self::extractTime($oh['timebegin'] ?? '', '');
                $e = self::extractTime($oh['timeend']   ?? '', '');
                if (!$s || !$e) continue;
                $os = strtotime("$date $s:00");
                $oe = strtotime("$date $e:00");
                if ($slotTs >= $os && $slotTs < $oe) return false;
            }
            return true;
        });
    }
}
