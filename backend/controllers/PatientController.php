<?php
// ============================================================
// controllers/PatientController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';
require_once __DIR__ . '/../helpers/PasswordHelper.php';

class PatientController {

    // GET /api/patients/profile
    public static function getProfile(): void {
        $session = AuthMiddleware::authenticate();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT p.*, b.namefr as BaladiyaName, b.namear as BaladiyaNameAr, b.wilaya_id
            FROM patients p
            LEFT JOIN baladiyas b ON b.id = p.baladiya_id
            WHERE p.user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();

        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        if (!empty($patient['photoprofile'])) {
            $patient['photoprofile'] = base64_encode($patient['photoprofile']);
        } else {
            $patient['photoprofile'] = null;
        }

        Response::success($patient);
    }

    // POST /api/patients/photo
    public static function uploadPhoto(): void {
        $session = AuthMiddleware::authenticate();
        if ((int)$session['usertype'] !== 0) {
            Response::error('غير مسموح لك بالوصول.', 403);
        }

        if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            Response::error('حدث خطأ أثناء تحميل الصورة.', 400);
        }

        $file = $_FILES['photo'];
        $maxSize = 5 * 1024 * 1024; // 5 MB

        // 1. Fichier vide ou non uploadé via HTTP POST
        if (empty($file['tmp_name']) || (int)$file['size'] === 0 || !is_uploaded_file($file['tmp_name'])) {
            Response::error('الملف فارغ أو غير صالح.', 400);
        }

        // 2. Taille maximale (5 MB)
        if ($file['size'] > $maxSize) {
            Response::error('الملف يتجاوز الحد الأقصى المسموح به للحجم وهو 5 ميجابايت.', 400);
        }

        // 3. Extension de fichier autorisée
        $extension = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($extension, $allowedExtensions, true)) {
            Response::error('امتداد الملف غير مدعوم. الصيغ المقبولة: JPG, PNG, GIF, WebP.', 400);
        }

        // 4. Validation MIME réelle basée sur les octets magiques (contenu réel)
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedMimes, true)) {
            Response::error('نوع الملف غير مدعوم. التنسيقات المقبولة هي: JPEG، PNG، GIF، WebP.', 400);
        }

        // 5. Validation de cohérence d'image (intégrité du contenu)
        $imageInfo = @getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            Response::error('محتوى الملف تالف أو لا يمثل صورة صالحة.', 400);
        }

        $fileContent = file_get_contents($file['tmp_name']);
        if ($fileContent === false || strlen($fileContent) === 0) {
            Response::error('تعذر قراءة ملف الصورة.', 400);
        }

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient_id = $stmt->fetchColumn();

        if (!$patient_id) {
            Response::error('لم يتم العثور على الملف الشخصي للمريض.', 404);
        }

        $stmtUpdate = $pdo->prepare("UPDATE patients SET photoprofile = ? WHERE id = ?");
        $stmtUpdate->bindParam(1, $fileContent, PDO::PARAM_LOB);
        $stmtUpdate->bindParam(2, $patient_id);
        $stmtUpdate->execute();

        Response::success([
            'photoprofile' => base64_encode($fileContent)
        ], 'تم تحديث الصورة الشخصية بنجاح.');
    }

    // PUT /api/patients/profile
    public static function updateProfile(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo     = Database::getInstance();

        // Get patient id
        $stmt = $pdo->prepare("SELECT id, phone, email FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        require_once __DIR__ . '/../helpers/UserValidationHelper.php';

        // التحقق من عدم تكرار رقم الهاتف
        if (!empty($data['phone'])) {
            $newPhone = trim($data['phone']);
            if (UserValidationHelper::isPhoneDuplicate($newPhone, $patient['id'])) {
                Response::error("رقم الهاتف مستخدم مسبقًا في حساب آخر.", 409);
            }
        }

        // التحقق من عدم تكرار البريد الإلكتروني إذا تم تعديله
        if (!empty($data['email'])) {
            $newEmail = trim($data['email']);
            if (UserValidationHelper::isEmailDuplicate($newEmail, $patient['id'])) {
                Response::error("البريد الإلكتروني مستخدم مسبقًا في حساب آخر.", 409);
            }
        }

        $allowed = ['fullname','phone','email','birthdate','address','gender','baladiya_id',
                    'birthplace','birthcountry','postcode','speakinglanguage','country',
                    'bloodtype','emergancyphone','emergancyemail','emergancynote','nin'];

        $fields = [];
        $values = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "`$field` = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) Response::error('لا توجد حقول لتحديثها.', 422);

        // عند إدخال أو تعديل رقم الهاتف، يتم تعيينه كمؤكد مباشرة (phonevalidation = 1)
        if (!empty($data['phone'])) {
            $fields[] = "`phonevalidation` = 1";
        }

        $values[] = $patient['id'];
        $pdo->prepare("UPDATE patients SET " . implode(', ', $fields) . " WHERE id = ?")
            ->execute($values);

        Response::success(null, 'تم تحديث الملف الشخصي بنجاح.');
    }

    // ---------------------------------------------------------------
    // PUT /api/patients/credentials
    // تغيير اسم المستخدم أو كلمة المرور للمريض
    // Body: { new_username?, new_password? }
    // ---------------------------------------------------------------
    public static function updateCredentials(): void {
        $session = AuthMiddleware::authenticate();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo     = Database::getInstance();

        // جلب بيانات المستخدم من جدول users
        $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::notFound('لم يتم العثور على حساب المستخدم.');
        }

        $updates = [];
        $values  = [];

        // --- تحديث اسم المستخدم (إن طُلب) ---
        if (!empty($data['new_username'])) {
            $newUsername = strtolower(trim($data['new_username']));

            // التحقق من صحة الصيغة: أحرف إنجليزية وأرقام وشرطات سفلية فقط
            if (!preg_match('/^[a-z0-9_]{3,30}$/', $newUsername)) {
                Response::error('اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام فقط (3-30 حرف).', 422);
            }

            // التحقق من عدم تكرار اسم المستخدم
            $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? AND id != ?");
            $stmtCheck->execute([$newUsername, $session['user_id']]);
            if ($stmtCheck->fetchColumn() > 0) {
                Response::error('اسم المستخدم هذا محجوز مسبقًا. يرجى اختيار اسم آخر.', 409);
            }

            $updates[] = "`username` = ?";
            $values[]  = $newUsername;
        }

        // --- تحديث كلمة المرور الجديدة (إن طُلبت) ---
        if (!empty($data['new_password'])) {
            // التحقق من كلمة المرور الحالية للأمان
            if (!empty($user['password'])) {
                if (empty($data['current_password'])) {
                    Response::error('يرجى إدخال كلمة المرور الحالية لتأكيد التغيير.', 422);
                }
                if (!PasswordHelper::verify($data['current_password'], $user['password'])) {
                    Response::error('كلمة المرور الحالية غير صحيحة.', 401);
                }
            }

            if (strlen($data['new_password']) < 6) {
                Response::error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.', 422);
            }
            $updates[] = "`password` = ?";
            // PHASE 02B : Nouveau mot de passe hashé en Bcrypt
            $values[]  = PasswordHelper::hash($data['new_password']);
        }

        // لا يوجد شيء للتحديث
        if (empty($updates)) {
            Response::error('يرجى تقديم اسم مستخدم جديد أو كلمة مرور جديدة على الأقل.', 422);
        }

        // تنفيذ التحديث
        $values[] = $session['user_id'];
        $pdo->prepare("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?")
            ->execute($values);

        Response::success(null, 'تم تحديث بيانات الدخول بنجاح.');
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
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        $stmt = $pdo->prepare("
            SELECT 
                a.id, a.apointementdate, a.note, a.patientname,
                a.clinicsdoctor_id, a.reason_id, a.status,
                cd.clinic_id as clinicid, cd.doctor_id, cd.specialtie_id,
                d.fullname as doctorname, d.email as doctoremail, d.photoprofile,
                c.clinicname, c.address as ClinicAddress,
                COALESCE(dr.reason_name, r.name) as ReasonName,
                s.namefr as specialtyfr, s.namear as specialtyar
            FROM apointements a
            LEFT JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
            LEFT JOIN doctors d         ON d.id = cd.doctor_id
            LEFT JOIN clinics c         ON c.id = cd.clinic_id
            LEFT JOIN doctorsreasons dr ON dr.id = a.reason_id
            LEFT JOIN reasons r         ON r.id = a.reason_id
            LEFT JOIN specialties s     ON s.id = cd.specialtie_id
            WHERE (a.patient_id = ? OR a.patient_id IN (SELECT proche_id FROM patientsproches WHERE patient_id = ?))
            ORDER BY a.apointementdate DESC
        ");
        $stmt->execute([$patient['id'], $patient['id']]);
        $appointments = $stmt->fetchAll();

        foreach ($appointments as &$a) {
            if (!empty($a['photoprofile'])) {
                $a['photoprofile'] = base64_encode($a['photoprofile']);
            }
        }

        Response::success($appointments);
    }

    // =========================================================================
    // ── Médecin Traitant (الطبيب المعالج) & Prise de RDV Rapide ──────────────
    // =========================================================================

    // GET /api/patients/attending-doctor
    public static function getAttendingDoctor(): void {
        $session = AuthMiddleware::patientOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id, doctor_id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        if (empty($patient['doctor_id'])) {
            Response::success(null);
            return;
        }

        $docStmt = $pdo->prepare("
            SELECT 
                d.id, d.fullname, d.email, d.fix, d.phone, d.pricing, d.photoprofile,
                s.id as specialty_id, s.namefr as specialtyfr, s.namear as specialtyar
            FROM doctors d
            LEFT JOIN specialties s ON s.id = d.specialtie_id
            WHERE d.id = ? AND d.status = 'APPROVED' AND (d.is_frozen = 0 OR d.is_frozen IS NULL)
            LIMIT 1
        ");
        $docStmt->execute([$patient['doctor_id']]);
        $doctor = $docStmt->fetch(PDO::FETCH_ASSOC);

        if (!$doctor) {
            Response::success(null);
            return;
        }

        if (!empty($doctor['photoprofile'])) {
            $doctor['photoprofile'] = base64_encode($doctor['photoprofile']);
        }

        // Fetch associated clinics for this doctor
        $clinicsStmt = $pdo->prepare("
            SELECT 
                cd.id as clinicsdoctor_id, cd.clinic_id, cd.status,
                c.clinicname, c.address, c.phone as clinic_phone
            FROM clinicsdoctors cd
            JOIN clinics c ON c.id = cd.clinic_id
            WHERE cd.doctor_id = ? AND (cd.status = 'ACCEPTED' OR cd.status = 'APPROVED')
        ");
        $clinicsStmt->execute([$doctor['id']]);
        $doctor['clinics'] = $clinicsStmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch doctor's consultation reasons
        $reasonsStmt = $pdo->prepare("
            SELECT id, reason_name, reason_time, reason_color
            FROM doctorsreasons
            WHERE doctor_id = ?
        ");
        $reasonsStmt->execute([$doctor['id']]);
        $doctor['reasons'] = $reasonsStmt->fetchAll(PDO::FETCH_ASSOC);

        // Also fetch doctor's schedule settings if available
        $schedStmt = $pdo->prepare("
            SELECT timescale, daytimestart, daytimeend, weekbeginday, workingdays, countdays
            FROM doctorssettingapointements
            WHERE doctor_id = ?
            LIMIT 1
        ");
        $schedStmt->execute([$doctor['id']]);
        $doctor['Schedule'] = $schedStmt->fetch(PDO::FETCH_ASSOC) ?: null;

        Response::success($doctor);
    }

    // POST /api/patients/attending-doctor
    public static function setAttendingDoctor(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $doctorId = trim($data['doctor_id'] ?? '');

        if (!$doctorId) {
            Response::error('معرف الطبيب مطلوب.', 422);
        }

        $pdo = Database::getInstance();

        // Verify doctor exists and is approved
        $docStmt = $pdo->prepare("SELECT id FROM doctors WHERE id = ? AND status = 'APPROVED' AND (is_frozen = 0 OR is_frozen IS NULL) LIMIT 1");
        $docStmt->execute([$doctorId]);
        if (!$docStmt->fetchColumn()) {
            Response::notFound('الطبيب غير موجود أو غير معتمد.');
        }

        $upd = $pdo->prepare("UPDATE patients SET doctor_id = ? WHERE user_id = ?");
        $upd->execute([$doctorId, $session['user_id']]);

        Response::success(['doctor_id' => $doctorId], 'تم تعيين الطبيب المعالج بنجاح.');
    }

    // DELETE /api/patients/attending-doctor
    public static function removeAttendingDoctor(): void {
        $session = AuthMiddleware::patientOnly();
        $pdo     = Database::getInstance();

        $upd = $pdo->prepare("UPDATE patients SET doctor_id = NULL WHERE user_id = ?");
        $upd->execute([$session['user_id']]);

        Response::success(null, 'تم إلغاء تعيين الطبيب المعالج.');
    }

    // GET /api/patients/attending-doctor/history
    public static function getAttendingDoctorHistory(): void {
        $session = AuthMiddleware::patientOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT id, doctor_id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient || empty($patient['doctor_id'])) {
            Response::success([]);
            return;
        }

        $docId = $patient['doctor_id'];

        $apptStmt = $pdo->prepare("
            SELECT 
                a.id, a.apointementdate, a.note, a.patientname,
                a.clinicsdoctor_id, a.reason_id, a.status,
                c.clinicname, c.address as clinic_address,
                COALESCE(dr.reason_name, r.name) as reason_name
            FROM apointements a
            JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id
            LEFT JOIN clinics c ON c.id = cd.clinic_id
            LEFT JOIN doctorsreasons dr ON dr.id = a.reason_id
            LEFT JOIN reasons r ON r.id = a.reason_id
            WHERE a.patient_id = ? AND cd.doctor_id = ?
            ORDER BY a.apointementdate DESC
        ");
        $apptStmt->execute([$patient['id'], $docId]);
        $history = $apptStmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success($history);
    }

    // GET /api/patients/attending-doctor/search?q=...
    public static function searchDoctorsForAttending(): void {
        $session = AuthMiddleware::patientOnly();
        $pdo     = Database::getInstance();
        $q       = trim($_GET['q'] ?? '');

        $sql = "
            SELECT 
                d.id, d.fullname, d.email, d.phone, d.fix, d.pricing, d.photoprofile,
                s.namefr as specialtyfr, s.namear as specialtyar,
                (
                    SELECT c.clinicname 
                    FROM clinicsdoctors cd 
                    JOIN clinics c ON c.id = cd.clinic_id 
                    WHERE cd.doctor_id = d.id AND (cd.status = 'ACCEPTED' OR cd.status = 'APPROVED')
                    LIMIT 1
                ) as primary_clinic
            FROM doctors d
            LEFT JOIN specialties s ON s.id = d.specialtie_id
            WHERE d.status = 'APPROVED' AND (d.is_frozen = 0 OR d.is_frozen IS NULL)
        ";
        $params = [];

        if ($q !== '') {
            $sql .= " AND (d.fullname LIKE ? OR s.namefr LIKE ? OR s.namear LIKE ?)";
            $wild = "%$q%";
            $params = [$wild, $wild, $wild];
        }

        $sql .= " ORDER BY d.fullname ASC LIMIT 20";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($doctors as &$d) {
            if (!empty($d['photoprofile'])) {
                $d['photoprofile'] = base64_encode($d['photoprofile']);
            }
        }

        Response::success($doctors);
    }
}
