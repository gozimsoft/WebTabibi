<?php
// ============================================================
// controllers/ClinicController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ClinicController
{

    // GET /api/clinics/profile
    public static function getProfile(): void
    {
        $session = AuthMiddleware::authenticate();
        if ($session['usertype'] != 2)
            Response::error('Non autorisé', 403);

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("
            SELECT c.*, u.username 
            FROM clinics c 
            JOIN users u ON u.id = c.user_id
            WHERE c.user_id = ? 
            LIMIT 1
        ");
        $stmt->execute([$session['user_id']]);
        $clinic = $stmt->fetch();

        if (!$clinic)
            Response::notFound('Profil clinique non trouvé');

        if (!empty($clinic['logo'])) {
            $clinic['logo'] = base64_encode($clinic['logo']);
        }

        Response::success($clinic);
    }

    // PUT /api/clinics/profile
    public static function updateProfile(): void
    {
        $session = AuthMiddleware::authenticate();
        if ($session['usertype'] != 2)
            Response::error('Non autorisé', 403);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo = Database::getInstance();

        // 1. Update users table
        $userFields = [];
        $userValues = [];
        if (!empty($data['username'])) {
            $check = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
            $check->execute([$data['username'], $session['user_id']]);
            if ($check->fetchColumn())
                Response::error("Nom d'utilisateur déjà pris", 409);
            $userFields[] = "`username` = ?";
            $userValues[] = $data['username'];
        }
        if (!empty($data['password'])) {
            $userFields[] = "`password` = ?";
            $userValues[] = base64_encode($data['password']);
        }
        if (!empty($userFields)) {
            $userValues[] = $session['user_id'];
            $pdo->prepare("UPDATE users SET " . implode(', ', $userFields) . " WHERE id = ?")->execute($userValues);
        }

        // 2. Update clinics table
        $clinicid = $session['clinic_id'] ?? self::getClinicId($session['user_id']);
        if ($clinicid) {
            $allowed = ['clinicname', 'email', 'phone', 'address', 'notes', 'fax', 'website', 'typeclinic', 'cliniccoordinates'];
            $fields = [];
            $values = [];
            foreach ($allowed as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "`$field` = ?";
                    $values[] = $data[$field];
                }
            }
            if (!empty($fields)) {
                $values[] = $clinicid;
                $pdo->prepare("UPDATE clinics SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);
            }
        }

        Response::success(null, 'Profil mis à jour avec succès');
    }

    // POST /api/clinics/profile  (Delphi desktop sync)
    public static function uploadProfile(): void
    {
        $session = AuthMiddleware::authenticate();
        if ((int) $session['usertype'] !== 2)
            Response::error('Non autorisé', 403);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo = Database::getInstance();

        // Resolve clinic_id from session user
        $clinicid = self::getClinicId($session['user_id']);
        if (!$clinicid)
            Response::notFound('Profil clinique non trouvé');

        // Map of incoming JSON keys → DB columns
        $map = [
            'clinicname' => 'clinicname',
            'phone' => 'phone',
            'fax' => 'fax',
            'address' => 'address',
            'email' => 'email',
            'webSite' => 'website',
            'typeclinic' => 'typeclinic',
            'cliniccoordinates' => 'cliniccoordinates',
        ];

        $fields = [];
        $values = [];
        foreach ($map as $jsonKey => $dbCol) {
            if (array_key_exists($jsonKey, $data)) {
                $fields[] = "`$dbCol` = ?";
                $values[] = $data[$jsonKey];
            }
        }

        if (empty($fields)) {
            Response::error('Aucune donnée à mettre à jour', 422);
        }

        $values[] = $clinicid;
        $sql = "UPDATE clinics SET " . implode(', ', $fields) . " WHERE id = ?";
        $pdo->prepare($sql)->execute($values);

        // Return the updated clinic
        $stmt = $pdo->prepare("SELECT * FROM clinics WHERE id = ? LIMIT 1");
        $stmt->execute([$clinicid]);
        $clinic = $stmt->fetch();
        unset($clinic['logo']); // don't return blob

        Response::success($clinic, 'Profil clinique mis à jour avec succès');
    }

    // POST /api/clinics/logo (Self upload — multipart OR base64 JSON)
    public static function uploadSelfLogo(): void
    {
        $session = AuthMiddleware::authenticate();
        if ((int) $session['usertype'] !== 2)
            Response::error('Non autorisé', 403);

        $clinicid = $session['clinic_id'] ?? self::getClinicId($session['user_id']);
        if (!$clinicid)
            Response::error('Profil non trouvé', 404);

        $imageData = null;
        $maxSize = 5 * 1024 * 1024; // 5 MB

        // Option 1: multipart file upload (field "photo")
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
        // Option 2: JSON body with base64 (Delphi desktop)
        else {
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            if (empty($input['logo']) && empty($input['photo'])) {
                Response::error('Aucune photo fournie. Envoyez un fichier (champ "photo") ou un JSON { "logo": "base64..." }', 422);
            }
            $base64 = $input['logo'] ?? $input['photo'];
            // Strip data URI prefix if present
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

        $pdo = Database::getInstance();
        $pdo->prepare("UPDATE clinics SET logo = ? WHERE id = ?")
            ->execute([$imageData, $clinicid]);

        Response::success(null, 'Logo mis à jour avec succès');
    }

    // GET /api/clinics?q=&specialty=&wilaya=&page=1&limit=20
    public static function search(): void
    {
        $pdo = Database::getInstance();

        $q = $_GET['q'] ?? '';
        $specialty = $_GET['specialty'] ?? '';
        $wilaya = $_GET['wilaya'] ?? '';
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = min(50, max(1, (int) ($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $params = [];
        $whereQ = "1=1";
        if ($q) {
            $whereQ = "(c.clinicname LIKE ? OR d.fullname LIKE ? OR s.namefr LIKE ? OR s.namear LIKE ?)";
            $like = "%$q%";
            $params = [$like, $like, $like, $like];
        }

        $user = AuthMiddleware::authenticate(false);
        $myDoctorId = null;
        $myClinicId = null;
        if ($user) {
            if ($user['usertype'] == 1)
                $myDoctorId = $user['doctor_id'] ?? self::getDoctorId($user['user_id']);
            if ($user['usertype'] == 2)
                $myClinicId = $user['clinic_id'] ?? self::getClinicId($user['user_id']);
        }

        // Add specialty/wilaya filters to whereQ
        if ($specialty) {
            $whereQ .= " AND (cd.specialtie_id = ? OR d.specialtie_id = ?)";
            $params[] = $specialty;
            $params[] = $specialty;
        }
        if ($wilaya) {
            $whereQ .= " AND (d.baladiya_id IN (SELECT id FROM baladiyas WHERE wilaya_id = ?) OR c.baladiya_id IN (SELECT id FROM baladiyas WHERE wilaya_id = ?))";
            $params[] = $wilaya;
            $params[] = $wilaya;
        }

        // We use a UNION to get both clinics and Doctor-at-Clinic entries
        // note: We need to match column counts and types
        $query = "
            (
                SELECT 
                    'CLINIC' as ResultType,
                    c.id as ResultId,
                    c.id as clinicid,
                    c.clinicname,
                    c.address as ClinicAddress,
                    c.phone as ClinicPhone,
                    NULL as doctor_id,
                    NULL as doctorname,
                    c.logo as photoprofile,
                    0 as experience,
                    0 as pricing,
                    NULL as specialtyid,
                    NULL as specialtyfr,
                    NULL as specialtyar,
                    0 as AvgRating,
                    0 as RatingCount,
                    (SELECT status FROM clinicsdoctors WHERE clinic_id = c.id AND doctor_id = " . ($myDoctorId ? $pdo->quote($myDoctorId) : "NULL") . " LIMIT 1) as relationstatus
                FROM clinics c
                WHERE UPPER(c.status) = 'APPROVED' AND c.clinicname LIKE ?
                GROUP BY c.id
            )
            UNION ALL
            (
                SELECT 
                    'DOCTOR' as ResultType,
                    d.id as ResultId,
                    MAX(c.id) as clinicid,
                    MAX(c.clinicname) as clinicname,
                    MAX(c.address) as ClinicAddress,
                    MAX(c.phone) as ClinicPhone,
                    d.id as doctor_id,
                    d.fullname as doctorname,
                    d.photoprofile,
                    d.experience,
                    d.pricing,
                    MAX(s.id) as specialtyid,
                    MAX(s.namefr) as specialtyfr,
                    MAX(s.namear) as specialtyar,
                    COALESCE(AVG(dr2.rating), 0) as AvgRating,
                    COUNT(dr2.id) as RatingCount,
                    (SELECT status FROM clinicsdoctors WHERE doctor_id = d.id AND clinic_id = " . ($myClinicId ? $pdo->quote($myClinicId) : "NULL") . " LIMIT 1) as relationstatus
                FROM doctors d
                LEFT JOIN clinicsdoctors cd ON cd.doctor_id = d.id
                LEFT JOIN clinics c ON c.id = cd.clinic_id
                LEFT JOIN specialties s ON s.id = COALESCE(d.specialtie_id, cd.specialtie_id)
                LEFT JOIN doctorsratings dr2 ON dr2.doctor_id = d.id
                WHERE UPPER(d.status) = 'APPROVED'
                AND (c.status IS NULL OR UPPER(c.status) = 'APPROVED')
                AND (cd.status IS NULL OR UPPER(cd.status) IN ('APPROVED', 'ACCEPTED'))
                AND $whereQ
                GROUP BY d.id
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
            if (!empty($r['photoprofile'])) {
                $r['photoprofile'] = base64_encode($r['photoprofile']);
            }
            if (!empty($r['relationstatus'])) {
                $r['relationstatus'] = strtoupper($r['relationstatus']);
            }
        }

        Response::success([
            'items' => $results,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit),
        ]);
    }

    // GET /api/clinics/{id}
    public static function getClinic(string $id): void {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare("
            SELECT c.*,
                   GROUP_CONCAT(DISTINCT CONCAT_WS('|', d.id, d.fullname, COALESCE(s.namefr,''), COALESCE(s.namear,''), cd.id, COALESCE(s.id,'')) SEPARATOR ';;') as DoctorsList,
                   COALESCE(AVG(dr2.rating),0) as AvgRating,
                   COUNT(DISTINCT dr2.id) as RatingCount
            FROM clinics c
            LEFT JOIN clinicsdoctors cd ON cd.clinic_id = c.id
            LEFT JOIN doctors d         ON d.id = cd.doctor_id
            LEFT JOIN specialties s     ON s.id = cd.specialtie_id
            LEFT JOIN doctorsratings dr2 ON dr2.doctor_id = d.id
            WHERE c.id = ? 
              AND UPPER(c.status) = 'APPROVED' 
              AND (UPPER(d.status) = 'APPROVED' OR d.status IS NULL)
              AND (UPPER(cd.status) IN ('APPROVED', 'ACCEPTED') OR cd.status IS NULL)
            GROUP BY c.id
        ");
        $stmt->execute([$id]);
        $clinic = $stmt->fetch();

        if (!$clinic)
            Response::notFound('clinique non trouvée');

        // Parse doctors list
        $doctors = [];
        if (!empty($clinic['DoctorsList'])) {
            foreach (explode(';;', $clinic['DoctorsList']) as $row) {
                [$did, $dname, $sfr, $sar, $cdid, $sid] = explode('|', $row);

                // Fetch photo separately (or we could have joined but this is safer for BLOBs)
                $pStmt = $pdo->prepare("SELECT photoprofile FROM doctors WHERE id = ?");
                $pStmt->execute([$did]);
                $photo = $pStmt->fetchColumn();

                $doctors[] = [
                    'doctor_id' => $did,
                    'doctorname' => $dname,
                    'specialtyfr' => $sfr,
                    'specialtyar' => $sar,
                    'clinicsdoctor_id' => $cdid,
                    'specialtyid' => $sid,
                    'photoprofile' => $photo ? base64_encode($photo) : null
                ];
            }
        }
        if (!empty($clinic['logo'])) {
            $clinic['logo'] = base64_encode($clinic['logo']);
        }
        unset($clinic['DoctorsList']);
        $clinic['doctors'] = $doctors;

        Response::success($clinic);
    }

    // GET /api/clinics/{clinicid}/doctors/{doctor_id}
    public static function getDoctorAtClinic(string $clinicid, string $doctor_id): void
    {
        $pdo = Database::getInstance();

        // Doctor basic info
        $stmt = $pdo->prepare("
            SELECT 
                d.*, 
                d.cnas as Cnas, d.casnos as Casnos,
                d.education as Education, d.presentation as Presentation,
                d.payementmethods as PayementMethods,
                cd.id as clinicsdoctor_id, cd.specialtie_id,
                s.namefr as specialtyfr, s.namear as specialtyar,
                b.namefr as BaladiyaName,
                COALESCE(AVG(dr2.rating),0) as AvgRating,
                COUNT(DISTINCT dr2.id) as RatingCount
            FROM doctors d
            JOIN clinicsdoctors cd ON cd.doctor_id = d.id AND cd.clinic_id = ?
            LEFT JOIN specialties s ON s.id = cd.specialtie_id
            LEFT JOIN baladiyas b  ON b.id = d.baladiya_id
            LEFT JOIN doctorsratings dr2 ON dr2.doctor_id = d.id
            WHERE d.id = ? 
            GROUP BY d.id, cd.id
        ");
        $stmt->execute([$clinicid, $doctor_id]);
        $doctor = $stmt->fetch();

        if (!$doctor) {
            Response::notFound('Médecin non trouvé dans cette clinique');
        }

        if (!empty($doctor['photoprofile'])) {
            $doctor['photoprofile'] = base64_encode($doctor['photoprofile']);
        } else {
            $doctor['photoprofile'] = null;
        }

        // Doctor's reasons
        $stmt2 = $pdo->prepare("
            SELECT id, reason_name, reason_time, reason_color
            FROM doctorsreasons
            WHERE doctor_id = ?
        ");
        $stmt2->execute([$doctor_id]);
        $doctor['reasons'] = $stmt2->fetchAll();

        // Schedule settings
        $stmt3 = $pdo->prepare("
            SELECT * FROM doctorssettingapointements
            WHERE doctor_id = ? AND clinic_id = ?
            LIMIT 1
        ");
        $stmt3->execute([$doctor_id, $clinicid]);
        $doctor['Schedule'] = $stmt3->fetch() ?: null;

        // Off hours
        $stmt4 = $pdo->prepare("
            SELECT * FROM doctorsoffhours
            WHERE doctor_id = ? AND clinic_id = ?
        ");
        $stmt4->execute([$doctor_id, $clinicid]);
        $doctor['OffHours'] = $stmt4->fetchAll();

        // All clinics for this doctor
        $stmtClinics = $pdo->prepare("
            SELECT c.id, c.clinicname, c.address, c.phone
            FROM clinics c
            JOIN clinicsdoctors cd ON cd.clinic_id = c.id
            WHERE cd.doctor_id = ? AND c.status = 'APPROVED' AND cd.status IN ('APPROVED', 'ACCEPTED')
        ");
        $stmtClinics->execute([$doctor_id]);
        $doctor['OtherClinics'] = $stmtClinics->fetchAll();

        // Ratings
        $stmt5 = $pdo->prepare("
            SELECT dr.id, dr.rating, dr.comment, dr.hidepatient,
                   CASE WHEN dr.hidepatient = 1 THEN 'Anonyme' ELSE p.fullname END as patientname
            FROM doctorsratings dr
            LEFT JOIN patients p ON p.id = dr.patient_id
            WHERE dr.doctor_id = ?
            ORDER BY dr.id DESC
            LIMIT 10
        ");
        $stmt5->execute([$doctor_id]);
        $doctor['Ratings'] = $stmt5->fetchAll();

        Response::success($doctor);
    }


    // GET /api/specialties
    public static function getSpecialties(): void
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM specialties ORDER BY namefr");
        $stmt->execute();
        Response::success($stmt->fetchAll());
    }

    // GET /api/wilayas
    public static function getWilayas(): void
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM wilayas ORDER BY Num");
        $stmt->execute();
        Response::success($stmt->fetchAll());
    }

    // GET /api/baladiya
    public static function getBaladiyas(): void
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM baladiyas ORDER BY postcode ");
        $stmt->execute();
        Response::success($stmt->fetchAll());
    }

    // GET /api/reasons
    public static function getReasons(): void
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM reasons ORDER BY name  ");
        $stmt->execute();
        Response::success($stmt->fetchAll());
    }

    // POST /api/clinics/{id}/photo
    // Accepts multipart file upload (field "photo") or JSON { "photo": "base64..." }
    public static function uploadPhoto(string $clinicid): void
    {
        //   $session = AuthMiddleware::doctorOnly();
        $pdo = Database::getInstance();

        // Check clinic exists
        $stmt3 = $pdo->prepare("SELECT id FROM clinics WHERE id = ? LIMIT 1");
        $stmt3->execute([$clinicid]);
        if (!$stmt3->fetch())
            Response::notFound('clinique non trouvée');

        $imageData = null;
        $maxSize = 5 * 1024 * 1024; // 5 MB

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

        // Update the logo column
        $stmt4 = $pdo->prepare("UPDATE clinics SET logo = ? WHERE id = ?");
        $stmt4->execute([$imageData, $clinicid]);

        Response::success(null, 'Photo de la clinique mise à jour avec succès');
    }

    // GET /api/clinics/{id}/photo
    // Returns the raw clinic logo image
    public static function getPhoto(string $clinicid): void
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT logo FROM clinics WHERE id = ? LIMIT 1");
        $stmt->execute([$clinicid]);
        $row = $stmt->fetch();

        if (!$row || empty($row['logo'])) {
            Response::notFound('Aucune photo trouvée pour cette clinique');
        }

        $logo = $row['logo'];

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

    public static function getDoctorId(string $userId): string
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id=? LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: '';
    }

    public static function getClinicId(string $userId): string
    {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM clinics WHERE user_id=? LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: '';
    }

    // GET /api/doctors/{id}
    public static function getDoctorPublicProfile(string $id): void
    {
        $pdo = Database::getInstance();

        // 1. Doctor basic info
        $stmt = $pdo->prepare("
            SELECT 
                d.*, 
                d.cnas as Cnas, d.casnos as Casnos,
                d.education as Education, d.presentation as Presentation,
                d.payementmethods as PayementMethods,
                s.namefr as specialtyfr, s.namear as specialtyar,
                b.namefr as BaladiyaName,
                COALESCE(AVG(dr2.rating),0) as AvgRating,
                COUNT(DISTINCT dr2.id) as RatingCount
            FROM doctors d
            LEFT JOIN specialties s ON s.id = d.specialtie_id
            LEFT JOIN baladiyas b  ON b.id = d.baladiya_id
            LEFT JOIN doctorsratings dr2 ON dr2.doctor_id = d.id
            WHERE d.id = ? AND (UPPER(d.status) = 'APPROVED')
            GROUP BY d.id
        ");
        $stmt->execute([$id]);
        $doctor = $stmt->fetch();

        if (!$doctor)
            Response::notFound('Médecin non trouvé');

        if (!empty($doctor['photoprofile'])) {
            $doctor['photoprofile'] = base64_encode($doctor['photoprofile']);
        }

        // 2. Reasons
        $stmt2 = $pdo->prepare("SELECT id, reason_name, reason_time, reason_color FROM doctorsreasons WHERE doctor_id = ?");
        $stmt2->execute([$id]);
        $doctor['reasons'] = $stmt2->fetchAll();

        // 3. Clinics where this doctor works
        $stmt3 = $pdo->prepare("
            SELECT c.id, c.clinicname, c.address, c.phone, cd.status as relationstatus
            FROM clinics c
            JOIN clinicsdoctors cd ON cd.clinic_id = c.id
            WHERE cd.doctor_id = ? AND UPPER(cd.status) IN ('APPROVED', 'ACCEPTED')
        ");
        $stmt3->execute([$id]);
        $doctor['OtherClinics'] = $stmt3->fetchAll();

        Response::success($doctor);
    }
}

