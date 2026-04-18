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
            SELECT p.*, b.NameFr as BaladiyaName, b.NameAr as BaladiyaNameAr
            FROM Patients p
            LEFT JOIN Baladiyas b ON b.ID = p.Baladiya_id
            WHERE p.User_id = ?
            LIMIT 1
        ");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();

        if (!$patient) Response::notFound('Profil patient non trouvé');
        unset($patient['PhotoProfile']);

        Response::success($patient);
    }

    // PUT /api/patients/profile
    public static function updateProfile(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo     = Database::getInstance();

        // Get patient ID
        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound();

        $allowed = ['FullName','Phone','Email','BirthDate','Address','Gender','Baladiya_id',
                    'BirthPlace','BirthCountry','PostCode','SpeakingLanguage','Country',
                    'BloodType','EmergancyPhone','EmergancyEmail','EmergancyNote'];

        $fields = [];
        $values = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "`$field` = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) Response::error('Aucun champ à mettre à jour', 422);

        $values[] = $patient['ID'];
        $pdo->prepare("UPDATE Patients SET " . implode(', ', $fields) . " WHERE ID = ?")
            ->execute($values);

        Response::success(null, 'Profil mis à jour avec succès');
    }

    // GET /api/patients/family
    public static function getFamilyMembers(): void {
        $session = AuthMiddleware::authenticate();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) { Response::success([]); return; }

        $stmt = $pdo->prepare("
            SELECT p.ID, p.FullName, p.Phone, p.Email, p.Gender, p.BirthDate
            FROM PatientsProches pp
            JOIN Patients p ON p.ID = pp.Proche_id
            WHERE pp.Patient_id = ?
        ");
        $stmt->execute([$patient['ID']]);
        $family = $stmt->fetchAll();
        Response::success($family);
    }

    // GET /api/patients/appointments
    public static function getAppointments(): void {
        $session = AuthMiddleware::patientOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound();

        $stmt = $pdo->prepare("
            SELECT 
                a.ID, a.AppointementDate, a.Note, a.PatientName,
                a.ClinicsDoctor_id, a.DoctorsReason_id,
                cd.Clinic_ID, cd.Doctor_ID, cd.specialtie_id,
                d.FullName as DoctorName, d.Email as DoctorEmail,
                c.ClinicName, c.Address as ClinicAddress,
                dr.reason_name as ReasonName,
                s.NameFr as SpecialtyFr, s.NameAr as SpecialtyAr
            FROM Apointements a
            LEFT JOIN ClinicsDoctors cd ON cd.ID = a.ClinicsDoctor_id
            LEFT JOIN Doctors d         ON d.ID = cd.Doctor_ID
            LEFT JOIN Clinics c         ON c.ID = cd.Clinic_ID
            LEFT JOIN DoctorsReasons dr ON dr.ID = a.DoctorsReason_id
            LEFT JOIN Specialties s     ON s.ID = cd.specialtie_id
            WHERE a.Patient_id = ?
            ORDER BY a.AppointementDate DESC
        ");
        $stmt->execute([$patient['ID']]);
        $appointments = $stmt->fetchAll();

        Response::success($appointments);
    }
}
