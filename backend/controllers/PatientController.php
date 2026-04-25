<?php
// ============================================================
// controllers/PatientController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class PatientController {

    // GET /api/patients/profile
    public static function getProfile(): void {
        $session = AuthMiddleware::authenticate();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT p.*, b.namefr as BaladiyaName, b.namear as BaladiyaNameAr
            FROM patients p
            LEFT JOIN baladiyas b ON b.id = p.baladiya_id
            WHERE p.user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();

        if (!$patient) Response::notFound('Profil patient non trouvé');
        unset($patient['photoprofile']);

        Response::success($patient);
    }

    // PUT /api/patients/profile
    public static function updateProfile(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo     = Database::getInstance();

        // Get patient id
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound();

        $allowed = ['fullname','phone','email','birthdate','address','gender','baladiya_id',
                    'birthplace','birthcountry','postcode','speakinglanguage','country',
                    'bloodtype','emergancyphone','emergancyemail','emergancynote'];

        $fields = [];
        $values = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "`$field` = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) Response::error('Aucun champ à mettre à jour', 422);

        $values[] = $patient['id'];
        $pdo->prepare("UPDATE patients SET " . implode(', ', $fields) . " WHERE id = ?")
            ->execute($values);

        Response::success(null, 'Profil mis à jour avec succès');
    }

    // GET /api/patients/family
    public static function getFamilyMembers(): void {
        $session = AuthMiddleware::authenticate();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) { Response::success([]); return; }

        $stmt = $pdo->prepare("
            SELECT p.id, p.fullname, p.phone, p.email, p.gender, p.birthdate
            FROM patientsproches pp
            JOIN patients p ON p.id = pp.proche_id
            WHERE pp.patient_id = ?
        ");
        $stmt->execute([$patient['id']]);
        $family = $stmt->fetchAll();
        Response::success($family);
    }

    // GET /api/patients/appointments
    public static function getAppointments(): void {
        $session = AuthMiddleware::patientOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound();

        $stmt = $pdo->prepare("
            SELECT 
                a.id, a.appointementdate, a.note, a.patientname,
                a.clinicsdoctor_id, a.doctorsreason_id,
                cd.clinic_id, cd.doctor_id, cd.specialtie_id,
                d.fullname as doctorname, d.email as doctoremail, d.photoprofile,
                c.clinicname, c.address as ClinicAddress,
                dr.reason_name as ReasonName,
                s.namefr as specialtyfr, s.namear as specialtyar
            FROM apointements a
            LEFT JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
            LEFT JOIN doctors d         ON d.id = cd.doctor_id
            LEFT JOIN clinics c         ON c.id = cd.clinic_id
            LEFT JOIN doctorsreasons dr ON dr.id = a.doctorsreason_id
            LEFT JOIN specialties s     ON s.id = cd.specialtie_id
            WHERE a.patient_id = ?
            ORDER BY a.appointementdate DESC
        ");
        $stmt->execute([$patient['id']]);
        $appointments = $stmt->fetchAll();

        foreach ($appointments as &$a) {
            if (!empty($a['photoprofile'])) {
                $a['photoprofile'] = base64_encode($a['photoprofile']);
            }
        }

        Response::success($appointments);
    }
}
