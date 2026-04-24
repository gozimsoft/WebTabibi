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

        $params = [];
        $whereQ = "1=1";
        if ($q) {
            $whereQ = "(c.ClinicName LIKE ? OR d.FullName LIKE ? OR s.NameFr LIKE ? OR s.NameAr LIKE ?)";
            $like = "%$q%";
            $params = [$like, $like, $like, $like];
        }

        // We use a UNION to get both Clinics and Doctor-at-Clinic entries
        // Note: We need to match column counts and types
        $query = "
            (
                SELECT 
                    'CLINIC' as ResultType,
                    c.ID as ResultId,
                    c.ID as ClinicId,
                    c.ClinicName,
                    c.Address as ClinicAddress,
                    c.Phone as ClinicPhone,
                    NULL as DoctorId,
                    NULL as DoctorName,
                    NULL as PhotoProfile,
                    0 as Experience,
                    0 as Pricing,
                    NULL as SpecialtyId,
                    NULL as SpecialtyFr,
                    NULL as SpecialtyAr,
                    0 as AvgRating,
                    0 as RatingCount
                FROM Clinics c
                WHERE c.Status = 'APPROVED' AND c.ClinicName LIKE ?
                GROUP BY c.ID
            )
            UNION ALL
            (
                SELECT 
                    'DOCTOR' as ResultType,
                    cd.ID as ResultId,
                    c.ID as ClinicId,
                    c.ClinicName,
                    c.Address as ClinicAddress,
                    c.Phone as ClinicPhone,
                    d.ID as DoctorId,
                    d.FullName as DoctorName,
                    d.PhotoProfile,
                    d.Experience,
                    d.Pricing,
                    s.ID as SpecialtyId,
                    s.NameFr as SpecialtyFr,
                    s.NameAr as SpecialtyAr,
                    COALESCE(AVG(dr2.Rating), 0) as AvgRating,
                    COUNT(dr2.ID) as RatingCount
                FROM ClinicsDoctors cd
                JOIN Clinics c ON c.ID = cd.Clinic_ID
                JOIN Doctors d ON d.ID = cd.Doctor_ID
                JOIN Specialties s ON s.ID = cd.specialtie_id
                LEFT JOIN DoctorsRatings dr2 ON dr2.Doctor_id = d.ID
                WHERE c.Status = 'APPROVED' AND d.Status = 'APPROVED' AND cd.Status IN ('APPROVED', 'ACCEPTED')
                AND $whereQ
                GROUP BY cd.ID
            )
            ORDER BY ResultType ASC, AvgRating DESC
            LIMIT $limit OFFSET $offset
        ";

        // Re-build params for UNION
        $finalParams = ["%$q%"]; // for clinic name
        $finalParams = array_merge($finalParams, $params); // for doctor search

        $stmt = $pdo->prepare($query);
        $stmt->execute($finalParams);
        $results = $stmt->fetchAll();

        // Approximate total (for simplicity, we'll just say results count + offset if full)
        $total = count($results) < $limit ? $offset + count($results) : $offset + $limit + 1;

        foreach ($results as &$r) {
            if (!empty($r['PhotoProfile'])) {
                $r['PhotoProfile'] = base64_encode($r['PhotoProfile']);
            }
        }

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
            WHERE c.ID = ? AND c.Status = 'APPROVED' AND (d.Status = 'APPROVED' OR d.Status IS NULL)
            AND (cd.Status IN ('APPROVED', 'ACCEPTED') OR cd.Status IS NULL)
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
                
                // Fetch photo separately (or we could have joined but this is safer for BLOBs)
                $pStmt = $pdo->prepare("SELECT PhotoProfile FROM Doctors WHERE ID = ?");
                $pStmt->execute([$did]);
                $photo = $pStmt->fetchColumn();
                
                $doctors[] = [
                    'DoctorId'          => $did,
                    'DoctorName'        => $dname,
                    'SpecialtyFr'       => $sfr,
                    'SpecialtyAr'       => $sar,
                    'ClinicsDoctor_id'  => $cdid,
                    'SpecialtyId'       => $sid,
                    'PhotoProfile'      => $photo ? base64_encode($photo) : null
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
            WHERE d.ID = ? AND d.Status = 'APPROVED' AND cd.Status IN ('APPROVED', 'ACCEPTED')
            GROUP BY d.ID, cd.ID
        ");
        $stmt->execute([$clinicId, $doctorId]);
        $doctor = $stmt->fetch();

        if (!$doctor) Response::notFound('Médecin non trouvé dans cette clinique');
        
        if (!empty($doctor['PhotoProfile'])) {
            $doctor['PhotoProfile'] = base64_encode($doctor['PhotoProfile']);
        } else {
            $doctor['PhotoProfile'] = null;
        }

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

        // All clinics for this doctor
        $stmtClinics = $pdo->prepare("
            SELECT c.ID, c.ClinicName, c.Address, c.Phone
            FROM Clinics c
            JOIN ClinicsDoctors cd ON cd.Clinic_ID = c.ID
            WHERE cd.Doctor_ID = ? AND c.Status = 'APPROVED' AND cd.Status IN ('APPROVED', 'ACCEPTED')
        ");
        $stmtClinics->execute([$doctorId]);
        $doctor['OtherClinics'] = $stmtClinics->fetchAll();

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

// GET /api/baladiya
    public static function getBaladiyas(): void {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM Baladiyas ORDER BY PostCode ");
        $stmt->execute();
        Response::success($stmt->fetchAll());
    }

// GET /api/reasons
    public static function getReasons(): void {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM Reasons ORDER BY Name  ");
        $stmt->execute();
        Response::success($stmt->fetchAll());
    }

    // POST /api/clinics/{id}/photo
    // Accepts multipart file upload (field "photo") or JSON { "photo": "base64..." }
    public static function uploadPhoto(string $clinicId): void {
     //   $session = AuthMiddleware::doctorOnly();
        $pdo     = Database::getInstance();
 
        // Check clinic exists
        $stmt3 = $pdo->prepare("SELECT ID FROM Clinics WHERE ID = ? LIMIT 1");
        $stmt3->execute([$clinicId]);
        if (!$stmt3->fetch()) Response::notFound('Clinique non trouvée');

        $imageData = null;
        $maxSize   = 5 * 1024 * 1024; // 5 MB

        // Option 1: multipart file upload
        if (!empty($_FILES['photo'])) {
            $file = $_FILES['photo'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                Response::error('Erreur lors de l\'upload du fichier (code: ' . $file['error'] . ')', 400);
            }
            if ($file['size'] > $maxSize) {
                Response::error('Le fichier dépasse la taille maximale de 5 Mo', 400);
            }
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            if (!in_array($mimeType, $allowedTypes)) {
                Response::error('Type de fichier non supporté. Formats acceptés: JPEG, PNG, GIF, WebP', 400);
            }
            $imageData = file_get_contents($file['tmp_name']);
        }
        // Option 2: JSON body with base64
        else {
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            if (empty($input['photo'])) {
                Response::error('Aucune photo fournie. Envoyez un fichier (champ "photo") ou un JSON { "photo": "base64..." }', 422);
            }
            // Strip data URI prefix if present (e.g. "data:image/png;base64,...")
            $base64 = $input['photo'];
            if (preg_match('/^data:image\/\w+;base64,/', $base64)) {
                $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $base64);
            }
            $imageData = base64_decode($base64, true);
            if ($imageData === false) {
                Response::error('Données base64 invalides', 400);
            }
            if (strlen($imageData) > $maxSize) {
                Response::error('L\'image dépasse la taille maximale de 5 Mo', 400);
            }
        }

        // Update the Logo column
        $stmt4 = $pdo->prepare("UPDATE Clinics SET Logo = ? WHERE ID = ?");
        $stmt4->execute([$imageData, $clinicId]);

        Response::success(null, 'Photo de la clinique mise à jour avec succès');
    }

    // GET /api/clinics/{id}/photo
    // Returns the raw clinic logo image
    public static function getPhoto(string $clinicId): void {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("SELECT Logo FROM Clinics WHERE ID = ? LIMIT 1");
        $stmt->execute([$clinicId]);
        $row = $stmt->fetch();

        if (!$row || empty($row['Logo'])) {
            Response::notFound('Aucune photo trouvée pour cette clinique');
        }

        $logo = $row['Logo'];

        // Detect MIME type from binary data
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_buffer($finfo, $logo);
        finfo_close($finfo);

        if (!$mimeType || !str_starts_with($mimeType, 'image/')) {
            $mimeType = 'image/jpeg'; // fallback
        }

        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . strlen($logo));
        header('Cache-Control: public, max-age=86400');
        echo $logo;
        exit;
    }

}
