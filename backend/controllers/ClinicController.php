<?php
// ============================================================
// controllers/ClinicController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ClinicController {

    // GET /api/clinics?q=&specialty=&wilaya=&page=1&limit=20
    public static function search(): void {
        $pdo = Database::getInstance();

        $q         = $_GET['q']         ?? '';
        $specialty = $_GET['specialty'] ?? '';
        $wilaya    = $_GET['wilaya']    ?? '';
        $page      = max(1, (int)($_GET['page']  ?? 1));
        $limit     = min(50, max(1, (int)($_GET['limit'] ?? 20)));
        $offset    = ($page - 1) * $limit;

        $where  = ['1=1'];
        $params = [];

        if ($q) {
            $where[]  = "(c.ClinicName LIKE ? OR d.FullName LIKE ? OR s.NameFr LIKE ? OR s.NameAr LIKE ?)";
            $like     = "%$q%";
            $params   = array_merge($params, [$like, $like, $like, $like]);
        }
        if ($specialty) {
            $where[]  = "cd.specialtie_id = ?";
            $params[] = $specialty;
        }
        if ($wilaya) {
            $where[]  = "b.ID IN (SELECT ID FROM Baladiyas WHERE NameFr LIKE ? OR NameAr LIKE ?)";
            $like     = "%$wilaya%";
            $params   = array_merge($params, [$like, $like]);
        }

        $whereSQL = implode(' AND ', $where);

        $countStmt = $pdo->prepare("
            SELECT COUNT(DISTINCT cd.ID)
            FROM ClinicsDoctors cd
            JOIN Clinics c    ON c.ID = cd.Clinic_ID
            JOIN Doctors d    ON d.ID = cd.Doctor_ID
            JOIN Specialties s ON s.ID = cd.specialtie_id
            LEFT JOIN Baladiyas b ON b.ID = d.Baladiya_id
            WHERE $whereSQL
        ");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT 
                cd.ID as ClinicsDoctor_id,
                c.ID as ClinicId, c.ClinicName, c.Address as ClinicAddress,
                c.Phone as ClinicPhone, c.Email as ClinicEmail,
                c.Latitude, c.Longitude, c.Emergency, c.TypeClinic,
                d.ID as DoctorId, d.FullName as DoctorName,
                d.Experience, d.Pricing, d.SpeakingLanguage,
                d.Degrees, d.AcademyTitles,
                s.ID as SpecialtyId, s.NameFr as SpecialtyFr, s.NameAr as SpecialtyAr,
                b.NameFr as BaladiyaName,
                COALESCE(AVG(dr2.Rating), 0) as AvgRating,
                COUNT(DISTINCT dr2.ID) as RatingCount
            FROM ClinicsDoctors cd
            JOIN Clinics c     ON c.ID = cd.Clinic_ID
            JOIN Doctors d     ON d.ID = cd.Doctor_ID
            JOIN Specialties s ON s.ID = cd.specialtie_id
            LEFT JOIN Baladiyas b     ON b.ID = d.Baladiya_id
            LEFT JOIN DoctorsRatings dr2 ON dr2.Doctor_id = d.ID
            WHERE $whereSQL
            GROUP BY cd.ID
            ORDER BY AvgRating DESC, d.Experience DESC
            LIMIT $limit OFFSET $offset
        ");
        $stmt->execute($params);
        $results = $stmt->fetchAll();

        Response::success([
            'items'       => $results,
            'total'       => $total,
            'page'        => $page,
            'limit'       => $limit,
            'total_pages' => ceil($total / $limit),
        ]);
    }

    // GET /api/clinics/{id}
    public static function getClinic(string $id): void {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("
            SELECT c.*,
                   GROUP_CONCAT(DISTINCT CONCAT(d.ID,'|',d.FullName,'|',s.NameFr,'|',s.NameAr,'|',cd.ID,'|',s.ID) SEPARATOR ';;') as DoctorsList,
                   COALESCE(AVG(dr2.Rating),0) as AvgRating,
                   COUNT(DISTINCT dr2.ID) as RatingCount
            FROM Clinics c
            LEFT JOIN ClinicsDoctors cd ON cd.Clinic_ID = c.ID
            LEFT JOIN Doctors d         ON d.ID = cd.Doctor_ID
            LEFT JOIN Specialties s     ON s.ID = cd.specialtie_id
            LEFT JOIN DoctorsRatings dr2 ON dr2.Doctor_id = d.ID
            WHERE c.ID = ?
            GROUP BY c.ID
        ");
        $stmt->execute([$id]);
        $clinic = $stmt->fetch();

        if (!$clinic) Response::notFound('Clinique non trouvée');

        // Parse doctors list
        $doctors = [];
        if (!empty($clinic['DoctorsList'])) {
            foreach (explode(';;', $clinic['DoctorsList']) as $row) {
                [$did, $dname, $sfr, $sar, $cdid, $sid] = explode('|', $row);
                $doctors[] = [
                    'DoctorId'          => $did,
                    'DoctorName'        => $dname,
                    'SpecialtyFr'       => $sfr,
                    'SpecialtyAr'       => $sar,
                    'ClinicsDoctor_id'  => $cdid,
                    'SpecialtyId'       => $sid,
                ];
            }
        }
        unset($clinic['DoctorsList'], $clinic['Logo']);
        $clinic['Doctors'] = $doctors;

        Response::success($clinic);
    }

    // GET /api/clinics/{clinicId}/doctors/{doctorId}
    public static function getDoctorAtClinic(string $clinicId, string $doctorId): void {
        $pdo  = Database::getInstance();

        // Doctor basic info
        $stmt = $pdo->prepare("
            SELECT 
                d.*, 
                cd.ID as ClinicsDoctor_id, cd.specialtie_id,
                s.NameFr as SpecialtyFr, s.NameAr as SpecialtyAr,
                b.NameFr as BaladiyaName,
                COALESCE(AVG(dr2.Rating),0) as AvgRating,
                COUNT(DISTINCT dr2.ID) as RatingCount
            FROM Doctors d
            JOIN ClinicsDoctors cd ON cd.Doctor_ID = d.ID AND cd.Clinic_ID = ?
            JOIN Specialties s     ON s.ID = cd.specialtie_id
            LEFT JOIN Baladiyas b  ON b.ID = d.Baladiya_id
            LEFT JOIN DoctorsRatings dr2 ON dr2.Doctor_id = d.ID
            WHERE d.ID = ?
            GROUP BY d.ID, cd.ID
        ");
        $stmt->execute([$clinicId, $doctorId]);
        $doctor = $stmt->fetch();

        if (!$doctor) Response::notFound('Médecin non trouvé dans cette clinique');
        unset($doctor['PhotoProfile']);

        // Doctor's reasons for this clinic
        $stmt2 = $pdo->prepare("
            SELECT dr.ID, dr.reason_name, dr.reason_time, dr.reason_color,
                   r.Name as BaseReasonName
            FROM DoctorsReasons dr
            LEFT JOIN Reasons r ON r.ID = dr.Reason_id
            WHERE dr.Doctor_id = ? AND dr.Clinic_id = ?
        ");
        $stmt2->execute([$doctorId, $clinicId]);
        $doctor['Reasons'] = $stmt2->fetchAll();

        // Schedule settings
        $stmt3 = $pdo->prepare("
            SELECT * FROM DoctorsSettingApointements
            WHERE Doctor_id = ? AND Clinic_id = ?
            LIMIT 1
        ");
        $stmt3->execute([$doctorId, $clinicId]);
        $doctor['Schedule'] = $stmt3->fetch() ?: null;

        // Off hours
        $stmt4 = $pdo->prepare("
            SELECT * FROM DoctorsOffHours
            WHERE Doctor_id = ? AND Clinic_id = ?
        ");
        $stmt4->execute([$doctorId, $clinicId]);
        $doctor['OffHours'] = $stmt4->fetchAll();

        // Ratings
        $stmt5 = $pdo->prepare("
            SELECT dr.ID, dr.Rating, dr.Comment, dr.HidePatient,
                   CASE WHEN dr.HidePatient = 1 THEN 'Anonyme' ELSE p.FullName END as PatientName
            FROM DoctorsRatings dr
            LEFT JOIN Patients p ON p.ID = dr.Patient_id
            WHERE dr.Doctor_id = ?
            ORDER BY dr.ID DESC
            LIMIT 10
        ");
        $stmt5->execute([$doctorId]);
        $doctor['Ratings'] = $stmt5->fetchAll();

        Response::success($doctor);
    }

    // GET /api/specialties
    public static function getSpecialties(): void {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM Specialties ORDER BY NameFr");
        $stmt->execute();
        Response::success($stmt->fetchAll());
    }

    // GET /api/wilayas
    public static function getWilayas(): void {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM Wilayas ORDER BY Num");
        $stmt->execute();
        Response::success($stmt->fetchAll());
    }
}
