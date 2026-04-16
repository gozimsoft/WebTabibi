<?php
// ============================================================
// controllers/AppointmentController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';
require_once __DIR__ . '/../helpers/EmailHelper.php';

class AppointmentController {

    // ----------------------------------------------------------
    // GET /api/appointments/available-slots
    // Query: clinics_doctor_id, date (YYYY-MM-DD)
    // Returns list of available time slots for that date
    // ----------------------------------------------------------
    public static function getAvailableSlots(): void {
        $cdId = $_GET['clinics_doctor_id'] ?? '';
        $date = $_GET['date'] ?? '';

        if (!$cdId || !$date) {
            Response::error('clinics_doctor_id et date sont requis', 422);
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            Response::error('Format de date invalide (YYYY-MM-DD)', 422);
        }

        $pdo = Database::getInstance();

        // Get ClinicsDoctors row
        $stmt = $pdo->prepare("SELECT * FROM ClinicsDoctors WHERE ID = ? LIMIT 1");
        $stmt->execute([$cdId]);
        $cd = $stmt->fetch();
        if (!$cd) Response::notFound('Médecin/Clinique introuvable');

        $doctorId = $cd['Doctor_ID'];
        $clinicId = $cd['Clinic_ID'];

        // Get schedule settings
        $stmt = $pdo->prepare("
            SELECT * FROM DoctorsSettingApointements
            WHERE Doctor_id = ? AND Clinic_id = ?
            LIMIT 1
        ");
        $stmt->execute([$doctorId, $clinicId]);
        $settings = $stmt->fetch();

        if (!$settings) {
            Response::error("Aucun planning configuré pour ce médecin", 404);
        }

        // Parse working days: "1111011" index 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
        $dayOfWeek = (int)date('w', strtotime($date)); // 0=Sun … 6=Sat
        $workingDays = $settings['WorkingDays'] ?? '1111011';

        if (strlen($workingDays) >= 7 && $workingDays[$dayOfWeek] === '0') {
            Response::success([], "Jour non travaillé");
        }

        // Build time slots
        $timeScale  = max(10, (int)$settings['TimeScale']); // minutes per slot
        $dayStart   = date('H:i', strtotime($settings['DaytimeStart'] ?? '08:00:00'));
        $dayEnd     = date('H:i', strtotime($settings['DaytimeEnd']   ?? '17:00:00'));

        $slots  = self::buildSlots($date, $dayStart, $dayEnd, $timeScale);

        // Remove off-hours slots
        $stmt = $pdo->prepare("
            SELECT Day, TimeBegin, TimeEnd FROM DoctorsOffHours
            WHERE Doctor_id = ? AND Clinic_id = ?
        ");
        $stmt->execute([$doctorId, $clinicId]);
        $offHours = $stmt->fetchAll();

        $slots = self::filterOffHours($slots, $date, $dayOfWeek, $offHours);

        // Remove already-booked slots
        $stmt = $pdo->prepare("
            SELECT AppointementDate FROM Apointements
            WHERE ClinicsDoctor_id = ?
              AND DATE(AppointementDate) = ?
        ");
        $stmt->execute([$cdId, $date]);
        $booked = array_column($stmt->fetchAll(), 'AppointementDate');

        $bookedTimes = array_map(fn($dt) => date('H:i', strtotime($dt)), $booked);

        $available = array_values(array_filter($slots, fn($slot) => !in_array($slot, $bookedTimes)));

        Response::success([
            'date'      => $date,
            'slots'     => $available,
            'timescale' => $timeScale,
        ]);
    }

    // ----------------------------------------------------------
    // POST /api/appointments
    // Body: { clinics_doctor_id, doctors_reason_id, date, time, note }
    // ----------------------------------------------------------
    public static function book(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];

        $required = ['clinics_doctor_id', 'doctors_reason_id', 'date', 'time'];
        foreach ($required as $f) {
            if (empty($data[$f])) Response::error("Le champ '$f' est requis", 422);
        }

        $pdo = Database::getInstance();

        // Get patient
        $stmt = $pdo->prepare("SELECT * FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('Profil patient introuvable');

        $cdId = $data['clinics_doctor_id'];

        // Verify ClinicsDoctor exists
        $stmt = $pdo->prepare("SELECT * FROM ClinicsDoctors WHERE ID = ? LIMIT 1");
        $stmt->execute([$cdId]);
        $cd = $stmt->fetch();
        if (!$cd) Response::notFound('Médecin/Clinique introuvable');

        // Verify reason belongs to this doctor/clinic
        $stmt = $pdo->prepare("
            SELECT * FROM DoctorsReasons
            WHERE ID = ? AND Doctor_id = ? AND Clinic_id = ?
            LIMIT 1
        ");
        $stmt->execute([$data['doctors_reason_id'], $cd['Doctor_ID'], $cd['Clinic_ID']]);
        $reason = $stmt->fetch();
        if (!$reason) Response::notFound('Motif introuvable pour ce médecin');

        $appointmentDatetime = $data['date'] . ' ' . $data['time'] . ':00';

        // Check slot not already taken
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM Apointements
            WHERE ClinicsDoctor_id = ? AND AppointementDate = ?
        ");
        $stmt->execute([$cdId, $appointmentDatetime]);
        if ($stmt->fetchColumn() > 0) {
            Response::error("Ce créneau est déjà pris. Veuillez en choisir un autre.", 409);
        }

        $appointmentId = UUIDHelper::generate();

        $pdo->prepare("
            INSERT INTO Apointements (ID, AppointementDate, Note, PatientName, ClinicsDoctor_id, DoctorsReason_id, Patient_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ")->execute([
            $appointmentId,
            $appointmentDatetime,
            $data['note'] ?? '',
            $patient['FullName'],
            $cdId,
            $data['doctors_reason_id'],
            $patient['ID'],
        ]);

        // Send email notification
        $stmt = $pdo->prepare("SELECT FullName FROM Doctors WHERE ID = ? LIMIT 1");
        $stmt->execute([$cd['Doctor_ID']]);
        $doctor = $stmt->fetch();

        $stmt = $pdo->prepare("SELECT ClinicName FROM Clinics WHERE ID = ? LIMIT 1");
        $stmt->execute([$cd['Clinic_ID']]);
        $clinic = $stmt->fetch();

        if (!empty($patient['Email'])) {
            EmailHelper::sendAppointmentConfirmation(
                $patient['Email'],
                $patient['FullName'],
                $doctor['FullName'] ?? 'Médecin',
                $clinic['ClinicName'] ?? 'Clinique',
                $appointmentDatetime,
                $reason['reason_name'] ?? 'Consultation'
            );
        }

        Response::success([
            'appointment_id' => $appointmentId,
            'date'           => $appointmentDatetime,
            'reason'         => $reason['reason_name'],
        ], 'Rendez-vous confirmé! Un email de confirmation vous a été envoyé.', 201);
    }

    // GET /api/appointments/{id}
    public static function getOne(string $id): void {
        $session = AuthMiddleware::authenticate();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT a.*,
                   d.FullName as DoctorName,
                   c.ClinicName, c.Address as ClinicAddress,
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

        // Verify ownership
        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();

        if (!$patient || $appt['Patient_id'] !== $patient['ID']) {
            Response::error('Accès interdit', 403);
        }

        Response::success($appt);
    }

    // DELETE /api/appointments/{id}  → cancel
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

        // Only allow cancellation in future
        if (strtotime($appt['AppointementDate']) < time()) {
            Response::error("Impossible d'annuler un rendez-vous passé", 400);
        }

        $pdo->prepare("DELETE FROM Apointements WHERE ID = ?")->execute([$id]);

        // Send cancellation email
        $stmt = $pdo->prepare("SELECT * FROM Patients WHERE ID = ? LIMIT 1");
        $stmt->execute([$patient['ID']]);
        $patientData = $stmt->fetch();
        if (!empty($patientData['Email'])) {
            EmailHelper::sendAppointmentCancellation(
                $patientData['Email'],
                $patientData['FullName'],
                $appt['AppointementDate']
            );
        }

        Response::success(null, 'Rendez-vous annulé avec succès');
    }

    // ----------------------------------------------------------
    // Private helpers
    // ----------------------------------------------------------
    private static function buildSlots(string $date, string $start, string $end, int $step): array {
        $slots    = [];
        $current  = strtotime("$date $start");
        $endTime  = strtotime("$date $end");

        while ($current < $endTime) {
            $slots[]  = date('H:i', $current);
            $current += $step * 60;
        }
        return $slots;
    }

    private static function filterOffHours(array $slots, string $date, int $dayOfWeek, array $offHours): array {
        return array_filter($slots, function ($slot) use ($date, $dayOfWeek, $offHours) {
            $slotTime = strtotime("$date $slot");
            foreach ($offHours as $oh) {
                if ((int)$oh['Day'] !== $dayOfWeek) continue;
                $offStart = strtotime("$date " . date('H:i', strtotime($oh['TimeBegin'])));
                $offEnd   = strtotime("$date " . date('H:i', strtotime($oh['TimeEnd'])));
                if ($slotTime >= $offStart && $slotTime < $offEnd) {
                    return false;
                }
            }
            return true;
        });
    }
}
