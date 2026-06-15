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

        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');
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
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

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
        $session = AuthMiddleware::patientOnly();
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
            if (strlen($data['new_password']) < 6) {
                Response::error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.', 422);
            }
            $updates[] = "`password` = ?";
            $values[]  = base64_encode($data['new_password']);
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
}
