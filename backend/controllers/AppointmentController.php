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

        $stmt = $pdo->prepare("SELECT * FROM ClinicsDoctors WHERE ID = ? LIMIT 1");
        $stmt->execute([$cdId]);
        $cd   = $stmt->fetch();
        if (!$cd) Response::notFound('Médecin/Clinique introuvable');

        $doctorId = $cd['Doctor_ID'];
        $clinicId = $cd['Clinic_ID'];

        $stmt = $pdo->prepare(
            "SELECT * FROM DoctorsSettingApointements WHERE Doctor_id = ? AND Clinic_id = ? LIMIT 1"
        );
        $stmt->execute([$doctorId, $clinicId]);
        $settings = $stmt->fetch();

        if (!$settings) {
            $settings = [
                'TimeScale'    => 30,
                'DaytimeStart' => '1899-12-30 08:00:00',
                'DaytimeEnd'   => '1899-12-30 17:00:00',
                'WorkingDays'  => '1111111',
            ];
        }

        // FIX: Use regex to extract HH:MM — avoids strtotime failure on 1899 dates
        $dayStart    = self::extractTime($settings['DaytimeStart'] ?? '', '08:00');
        $dayEnd      = self::extractTime($settings['DaytimeEnd']   ?? '', '17:00');
        $timeScale   = max(5, (int)($settings['TimeScale'] ?? 30));
        $workingDays = $settings['WorkingDays'] ?? '1111111';
        $weekBegin   = (int)($settings['WeekBeginDay'] ?? 0); // 0=Mon...6=Sun
        $countDays   = (int)($settings['CountDays'] ?? 30);

        // Check if date is within CountDays range
        $today = date('Y-m-d');
        $maxDate = date('Y-m-d', strtotime("+$countDays days"));
        if ($date < $today || $date > $maxDate) {
            Response::success(['date' => $date, 'slots' => [], 'timescale' => $timeScale, 'message' => 'Date hors limite']);
            return;
        }

        // Standard date('w') gives 0=Sun...6=Sat
        $w = (int)date('w', strtotime($date));
        
        // Map user's WeekBeginDay (0=Mon...6=Sun) to Standard (0=Sun...6=Sat)
        // 0=Mon -> 1, 1=Tue -> 2, ..., 5=Sat -> 6, 6=Sun -> 0
        $stdWBD = ($weekBegin + 1) % 7;
        
        // Calculate relative index in WorkingDays array
        $relIndex = ($w - $stdWBD + 7) % 7;

        if (strlen($workingDays) > $relIndex && $workingDays[$relIndex] === '0') {
            Response::success(['date' => $date, 'slots' => [], 'timescale' => $timeScale]);
            return;
        }

        $slots = self::buildSlots($date, $dayStart, $dayEnd, $timeScale);

        // Remove off-hours
        $stmt = $pdo->prepare(
            "SELECT Day, TimeBegin, TimeEnd FROM DoctorsOffHours WHERE Doctor_id = ? AND Clinic_id = ?"
        );
        $stmt->execute([$doctorId, $clinicId]);
        $offHours = $stmt->fetchAll();
        $slots    = self::filterOffHours($slots, $date, $relIndex, $offHours);

        // Remove already-booked (across ALL clinics for this doctor)
        $stmt = $pdo->prepare("
            SELECT AppointementDate 
            FROM Apointements 
            WHERE (ClinicsDoctor_id IN (SELECT ID FROM ClinicsDoctors WHERE Doctor_ID = ?) OR Doctor_id = ?)
              AND DATE(AppointementDate) = ?
              AND IsDelete = 0
        ");
        $stmt->execute([$doctorId, $doctorId, $date]);
        $booked = $stmt->fetchAll();
        
        // Convert booked times to timestamps for easier comparison
        $bookedTimestamps = [];
        foreach ($booked as $r) {
            $ts = strtotime($r['AppointementDate'] ?? '');
            if ($ts) $bookedTimestamps[] = $ts;
        }

        $available = array_values(array_filter($slots, function($s) use ($date, $bookedTimestamps, $timeScale) {
            $slotStart = strtotime(trim($date) . ' ' . trim($s) . ':00');
            if (!$slotStart) return true; // Should not happen with valid inputs
            
            $slotEnd = $slotStart + ($timeScale * 60);
            
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
            'timescale' => $timeScale,
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

        $stmt = $pdo->prepare("SELECT * FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('Profil patient introuvable');

        $cdId = $data['clinics_doctor_id'];

        $stmt = $pdo->prepare("SELECT * FROM ClinicsDoctors WHERE ID = ? LIMIT 1");
        $stmt->execute([$cdId]);
        $cd = $stmt->fetch();
        if (!$cd) Response::notFound('Médecin/Clinique introuvable (CD)');

        // Support booking for a family member
        $patientId    = $patient['ID'];
        $patientName  = $patient['FullName'];
        $patientEmail = $patient['Email'] ?? '';

        if (!empty($data['patient_id']) && $data['patient_id'] !== $patient['ID']) {
            $stmt = $pdo->prepare("SELECT * FROM PatientsProches WHERE Patient_id = ? AND Proche_id = ? LIMIT 1");
            $stmt->execute([$patient['ID'], $data['patient_id']]);
            if ($stmt->fetch()) {
                $stmt = $pdo->prepare("SELECT * FROM Patients WHERE ID = ? LIMIT 1");
                $stmt->execute([$data['patient_id']]);
                $familyMember = $stmt->fetch();
                if ($familyMember) {
                    $patientId   = $familyMember['ID'];
                    $patientName = $familyMember['FullName'];
                }
            }
        }

        // Validate reason if provided (optional)
        $reasonId   = !empty($data['doctors_reason_id']) ? $data['doctors_reason_id'] : null;
        $reasonName = 'Consultation';
        if ($reasonId) {
            $stmt = $pdo->prepare(
                "SELECT * FROM DoctorsReasons WHERE ID = ? AND Doctor_id = ? AND Clinic_id = ? LIMIT 1"
            );
            $stmt->execute([$reasonId, $cd['Doctor_ID'], $cd['Clinic_ID']]);
            $reasonRow = $stmt->fetch();
            if (!$reasonRow) Response::notFound('Motif introuvable pour ce médecin');
            $reasonName = $reasonRow['reason_name'] ?? 'Consultation';
        }

        $time = preg_replace('/[^0-9:]/', '', trim($data['time']));
        if (!preg_match('/^\d{2}:\d{2}$/', $time))
            Response::error("Format d'heure invalide. Attendu HH:MM", 422);

        $appointmentDatetime = $data['date'] . ' ' . $time . ':00';

        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM Apointements 
            WHERE (ClinicsDoctor_id IN (SELECT ID FROM ClinicsDoctors WHERE Doctor_ID = ?) OR Doctor_id = ?)
              AND AppointementDate = ?
              AND IsDelete = 0
        ");
        $stmt->execute([$cd['Doctor_ID'], $cd['Doctor_ID'], $appointmentDatetime]);
        if ($stmt->fetchColumn() > 0)
            Response::error('هذا الوقت محجوز بالفعل لدى الطبيب. يرجى اختيار وقت آخر.', 409);

        $appointmentId = UUIDHelper::generate();
        $pdo->prepare(
            "INSERT INTO Apointements (ID, AppointementDate, Note, PatientName, ClinicsDoctor_id, DoctorsReason_id, Patient_id, Doctor_id, Source)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'web')"
        )->execute([
            $appointmentId, $appointmentDatetime,
            $data['note'] ?? '', $patientName,
            $cdId, $reasonId, $patientId,
            $cd['Doctor_ID']
        ]);

        $stmt = $pdo->prepare("SELECT FullName FROM Doctors WHERE ID = ? LIMIT 1");
        $stmt->execute([$cd['Doctor_ID']]);
        $doctor = $stmt->fetch();

        $stmt = $pdo->prepare("SELECT ClinicName FROM Clinics WHERE ID = ? LIMIT 1");
        $stmt->execute([$cd['Clinic_ID']]);
        $clinic = $stmt->fetch();

        if (!empty($patientEmail)) {
            @EmailHelper::sendAppointmentConfirmation(
                $patientEmail, $patient['FullName'],
                $doctor['FullName'] ?? 'Médecin',
                $clinic['ClinicName'] ?? 'Clinique',
                $appointmentDatetime,
                $reasonName
            );
        }

        Response::success([
            'appointment_id' => $appointmentId,
            'date'           => $appointmentDatetime,
            'reason'         => $reasonName,
            'patient_name'   => $patientName,
        ], 'Rendez-vous confirmé! Email de confirmation envoyé.', 201);
    }

    public static function getOne(string $id): void {
        $session = AuthMiddleware::authenticate();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT a.*,
                   d.FullName as DoctorName, d.ID as DoctorId,
                   c.ClinicName, c.Address as ClinicAddress, c.ID as ClinicId,
                   dr.reason_name as ReasonName,
                   s.NameFr as SpecialtyFr
            FROM Apointements a
            LEFT JOIN ClinicsDoctors cd ON cd.ID = a.ClinicsDoctor_id
            LEFT JOIN Doctors d         ON d.ID = cd.Doctor_ID
            LEFT JOIN Clinics c         ON c.ID = cd.Clinic_ID
            LEFT JOIN DoctorsReasons dr ON dr.ID = a.DoctorsReason_id
            LEFT JOIN Specialties s     ON s.ID = cd.specialtie_id
            WHERE a.ID = ?
        ");
        $stmt->execute([$id]);
        $appt = $stmt->fetch();
        if (!$appt) Response::notFound();

        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient || $appt['Patient_id'] !== $patient['ID'])
            Response::error('Accès interdit', 403);

        Response::success($appt);
    }

    public static function cancel(string $id): void {
        $session = AuthMiddleware::patientOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound();

        $stmt = $pdo->prepare("SELECT * FROM Apointements WHERE ID = ? AND Patient_id = ? LIMIT 1");
        $stmt->execute([$id, $patient['ID']]);
        $appt = $stmt->fetch();
        if (!$appt) Response::notFound('Rendez-vous non trouvé');

        if (strtotime($appt['AppointementDate']) < time())
            Response::error("Impossible d'annuler un rendez-vous passé", 400);

        $pdo->prepare("DELETE FROM Apointements WHERE ID = ?")->execute([$id]);

        $stmt = $pdo->prepare("SELECT * FROM Patients WHERE ID = ? LIMIT 1");
        $stmt->execute([$patient['ID']]);
        $pd = $stmt->fetch();
        if (!empty($pd['Email'])) {
            @EmailHelper::sendAppointmentCancellation(
                $pd['Email'], $pd['FullName'], $appt['AppointementDate']
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
                $s = self::extractTime($oh['TimeBegin'] ?? '', '');
                $e = self::extractTime($oh['TimeEnd']   ?? '', '');
                if (!$s || !$e) continue;
                $os = strtotime("$date $s:00");
                $oe = strtotime("$date $e:00");
                if ($slotTs >= $os && $slotTs < $oe) return false;
            }
            return true;
        });
    }
}
