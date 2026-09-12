<?php
// ============================================================
// controllers/DoctorController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';

class DoctorController {

    // GET /api/doctors/profile
    public static function getProfile(): void {
        $session = AuthMiddleware::authenticate();
        if ($session['usertype'] != 1) {
            Response::error('غير مسموح لك بالوصول.', 403);
        }
        
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT d.*, u.username, s.namefr as specialtyfr, s.namear as specialtyar
            FROM doctors d
            JOIN users u ON u.id = d.user_id
            LEFT JOIN specialties s ON s.id = d.specialtie_id
            WHERE d.user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$doctor) Response::notFound('لم يتم العثور على الملف الشخصي للطبيب.');
        
        if (!empty($doctor['photoprofile'])) {
            $doctor['photoprofile'] = base64_encode($doctor['photoprofile']);
        }

        // Fetch associated clinics for this doctor
        $stmt = $pdo->prepare("
            SELECT cd.id as clinicsdoctor_id, c.clinicname, c.id as clinic_id
            FROM clinicsdoctors cd
            JOIN clinics c ON c.id = cd.clinic_id
            WHERE cd.doctor_id = ?
        ");
        $stmt->execute([$doctor['id']]);
        $doctor['clinics'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch reasons
        $stmt = $pdo->prepare("
            SELECT id, reason_name, clinic_id 
            FROM doctorsreasons 
            WHERE doctor_id = ?
        ");
        $stmt->execute([$doctor['id']]);
        $doctor['reasons'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success($doctor);
    }

    // PUT /api/doctors/profile
    public static function updateProfile(): void {
        $session = AuthMiddleware::authenticate();
        if ($session['usertype'] != 1) {
            Response::error('غير مسموح لك بالوصول.', 403);
        }
        
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo  = Database::getInstance();

        // 1. Update users table (username / password)
        $userFields = [];
        $userValues = [];
        if (!empty($data['username'])) {
            // Check if username exists
            $check = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
            $check->execute([$data['username'], $session['user_id']]);
            if ($check->fetchColumn()) {
                Response::error("اسم المستخدم مستخدم بالفعل. يرجى اختيار اسم آخر.", 409);
            }
            $userFields[] = "`username` = ?";
            $userValues[] = $data['username'];
        }
        if (!empty($data['password'])) {
            $userFields[] = "`password` = ?";
            $userValues[] = base64_encode($data['password']); // encoding using the app's standard
        }

        if (!empty($userFields)) {
            $userValues[] = $session['user_id'];
            $pdo->prepare("UPDATE users SET " . implode(', ', $userFields) . " WHERE id = ?")->execute($userValues);
        }

        // 2. Update doctors table
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor_id = $stmt->fetchColumn();

        if ($doctor_id) {
            require_once __DIR__ . '/../helpers/UserValidationHelper.php';

            // التحقق من عدم تكرار رقم الهاتف
            if (!empty($data['phone'])) {
                $newPhone = trim($data['phone']);
                if (UserValidationHelper::isPhoneDuplicate($newPhone, $doctor_id)) {
                    Response::error("رقم الهاتف مستخدم مسبقًا في حساب آخر.", 409);
                }
            }

            // التحقق من عدم تكرار البريد الإلكتروني إذا تم تعديله
            if (!empty($data['email'])) {
                $newEmail = trim($data['email']);
                if (UserValidationHelper::isEmailDuplicate($newEmail, $doctor_id)) {
                    Response::error("البريد الإلكتروني مستخدم مسبقًا في حساب آخر.", 409);
                }
            }

            $allowed = [
                'fullname', 'email', 'phone', 'fix', 'casnos', 'speakinglanguage', 
                'rpps', 'numregister', 'pricing', 'degrees', 'academytitles', 
                'postcode', 'specialtie_id', 'nin'
            ];

            $fields = [];
            $values = [];
            foreach ($allowed as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "`$field` = ?";
                    $values[] = $data[$field];
                }
            }

            // عند إدخال أو تعديل رقم الهاتف، يسجل دائماً كمؤكد (phonevalidation = 1)
            if (!empty($data['phone'])) {
                $fields[] = "`phonevalidation` = 1";
            }

            if (!empty($fields)) {
                $values[] = $doctor_id;
                $pdo->prepare("UPDATE doctors SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);
            }
        }

        Response::success(null, 'تم تحديث الملف الشخصي بنجاح.');
    }

    // POST /api/doctors/photo
    public static function uploadPhoto(): void {
        $session = AuthMiddleware::authenticate();
        if ($session['usertype'] != 1) {
            Response::error('غير مسموح لك بالوصول.', 403);
        }

        if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            Response::error('حدث خطأ أثناء تحميل الصورة.', 400);
        }

        $fileContent = file_get_contents($_FILES['photo']['tmp_name']);
        if (!$fileContent) {
            Response::error('الملف فارغ أو غير صالح.', 400);
        }

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor_id = $stmt->fetchColumn();

        if (!$doctor_id) {
            Response::error('لم يتم العثور على الملف الشخصي.', 404);
        }

        $pdo->prepare("UPDATE doctors SET photoprofile = ? WHERE id = ?")
            ->execute([$fileContent, $doctor_id]);

        Response::success(null, 'تم تحديث الصورة الشخصية بنجاح.');
    }

    // POST /api/doctors/upload  (Delphi desktop — doctor uploads own data)
    public static function uploadDoctor(): void {
        $session = AuthMiddleware::authenticate();
        if ((int)$session['usertype'] !== 1) Response::error('غير مسموح لك بالوصول.', 403);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo  = Database::getInstance();

        // Get doctor_id from token
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctorId = $stmt->fetchColumn();
        if (!$doctorId) Response::notFound('لم يتم العثور على الملف الشخصي للطبيب.');

        $clinicId = trim($data['clinic_id'] ?? '');
        if (empty($clinicId)) Response::error('معرف العيادة (clinic_id) مطلوب.', 422);

        // Verify clinic exists
        $stmt = $pdo->prepare("SELECT id FROM clinics WHERE id = ? LIMIT 1");
        $stmt->execute([$clinicId]);
        if (!$stmt->fetchColumn()) Response::notFound('العيادة المطلوبة غير موجودة.');

        // JSON key → DB column mapping
        $doctorMap = [
            'fullname'=>'fullname','address'=>'address','phone'=>'phone','email'=>'email',
            'fax'=>'fax','baladiya_id'=>'baladiya_id','birthdate'=>'birthdate',
            'experience'=>'experience','specialtie_id'=>'specialtie_id',
            'payement_methods'=>'payementmethods','activity_sector'=>'activitysector',
            'education'=>'education','presentation'=>'presentation',
            'cnas'=>'cnas','casnos'=>'casnos','speaking_language'=>'speakinglanguage',
            'rpps'=>'rpps','num_register'=>'numregister','hide_rating'=>'hiderating',
            'pricing'=>'pricing','degrees'=>'degrees','academy_titles'=>'academytitles',
            'fix'=>'fix','postcode'=>'postcode','longitude'=>'longitude','latitude'=>'latitude',
            'nin'=>'nin',
        ];

        $pdo->beginTransaction();
        try {
            // 1. Update doctor profile
            $fields = []; $values = [];
            foreach ($doctorMap as $jk => $dc) {
                if (array_key_exists($jk, $data)) { $fields[] = "`$dc` = ?"; $values[] = $data[$jk]; }
            }
            if ($fields) { $values[] = $doctorId; $pdo->prepare("UPDATE doctors SET ".implode(',',$fields)." WHERE id=?")->execute($values); }

            // 2. Photo
            if (!empty($data['photo_profile'])) {
                $b64 = $data['photo_profile'];
                if (preg_match('/^data:image\/\w+;base64,/', $b64)) $b64 = preg_replace('/^data:image\/\w+;base64,/', '', $b64);
                $img = base64_decode($b64, true);
                if ($img !== false) $pdo->prepare("UPDATE doctors SET photoprofile=? WHERE id=?")->execute([$img, $doctorId]);
            }

            // 3. ClinicsDoctor relationship
            $specId = $data['specialtie_id'] ?? null;
            $stmt = $pdo->prepare("SELECT id FROM clinicsdoctors WHERE clinic_id=? AND doctor_id=? LIMIT 1");
            $stmt->execute([$clinicId, $doctorId]);
            $cdId = $stmt->fetchColumn();
            if (!$cdId) {
                $cdId = UUIDHelper::generate();
                $pdo->prepare("INSERT INTO clinicsdoctors (id,clinic_id,doctor_id,specialtie_id,status,requestedby) VALUES (?,?,?,?,'APPROVED',?)")
                    ->execute([$cdId,$clinicId,$doctorId,$specId,$doctorId]);
            } elseif ($specId) {
                $pdo->prepare("UPDATE clinicsdoctors SET specialtie_id=? WHERE id=?")->execute([$specId,$cdId]);
            }

            // 4. Reasons
            if (isset($data['reasons']) && is_array($data['reasons'])) {
                $pdo->prepare("DELETE FROM doctorsreasons WHERE doctor_id = ? AND clinic_id = ?")->execute([$doctorId, $clinicId]);
                foreach ($data['reasons'] as $r) {
                    $pdo->prepare("INSERT INTO doctorsreasons (id, doctor_id, clinic_id, reason_name, reason_time, reason_color) VALUES (?,?,?,?,?,?)")
                        ->execute([
                            UUIDHelper::generate(),
                            $doctorId,
                            $clinicId,
                            $r['reason_name'] ?? '',
                            $r['reason_time'] ?? 30,
                            $r['reason_color'] ?? 0
                        ]);
                }
            }

            // 5. Off hours
            if (isset($data['Offhour']) && is_array($data['Offhour'])) {
                $pdo->prepare("DELETE FROM doctorsoffhours WHERE doctor_id=? AND clinic_id=?")->execute([$doctorId,$clinicId]);
                foreach ($data['Offhour'] as $oh) {
                    $pdo->prepare("INSERT INTO doctorsoffhours (id,doctor_id,clinic_id,day,timebegin,timeend) VALUES (?,?,?,?,?,?)")
                        ->execute([UUIDHelper::generate(),$doctorId,$clinicId,$oh['day']??0,$oh['time_begin']??null,$oh['time_end']??null]);
                }
            }

            // 6. Appointment settings
            if (array_key_exists('time_scale', $data)) {
                $stmt = $pdo->prepare("SELECT id FROM doctorssettingapointements WHERE doctor_id=? AND clinic_id=? LIMIT 1");
                $stmt->execute([$doctorId,$clinicId]);
                $sId = $stmt->fetchColumn();
                $sVals = [
                    $data['time_scale']??30, $data['daytime_start']??null, $data['daytime_end']??null,
                    $data['week_begin_day']??0, $data['working_days']??'1111111',
                    $data['count_days']??30, isset($data['is_registered'])?($data['is_registered']?1:0):0,
                ];
                if ($sId) {
                    $sVals[] = $sId;
                    $pdo->prepare("UPDATE doctorssettingapointements SET timescale=?,daytimestart=?,daytimeend=?,weekbeginday=?,workingdays=?,countdays=?,isregistered=? WHERE id=?")->execute($sVals);
                } else {
                    array_unshift($sVals, UUIDHelper::generate(), $doctorId, $clinicId);
                    $pdo->prepare("INSERT INTO doctorssettingapointements (id,doctor_id,clinic_id,timescale,daytimestart,daytimeend,weekbeginday,workingdays,countdays,isregistered) VALUES (?,?,?,?,?,?,?,?,?,?)")->execute($sVals);
                }
            }

            $pdo->commit();
            Response::success(['doctor_id'=>$doctorId,'clinic_id'=>$clinicId,'clinicsdoctor_id'=>$cdId], 'تمت مزامنة بيانات الطبيب بنجاح.');

        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('حدث خطأ في الخادم أثناء مزامنة بيانات الطبيب.');
        }
    }

    // GET /api/doctors/reasons
    public static function getReasons(): void {
        $session = AuthMiddleware::authenticate();
        if ((int)$session['usertype'] !== 1) {
            Response::error('غير مسموح لك بالوصول.', 403);
        }

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctorId = $stmt->fetchColumn();
        if (!$doctorId) Response::notFound('لم يتم العثور على حساب الطبيب.');

        $stmt = $pdo->prepare("
            SELECT dr.id, dr.reason_id, dr.doctor_id, dr.clinic_id, dr.reason_name, dr.reason_time, dr.reason_color,
                   c.clinicname
            FROM doctorsreasons dr
            LEFT JOIN clinics c ON c.id = dr.clinic_id
            WHERE dr.doctor_id = ?
            ORDER BY dr.reason_name ASC
        ");
        $stmt->execute([$doctorId]);
        Response::success($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // POST /api/doctors/reasons
    public static function addReason(): void {
        $session = AuthMiddleware::authenticate();
        if ((int)$session['usertype'] !== 1) {
            Response::error('غير مسموح لك بالوصول.', 403);
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id, specialtie_id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$doctor) Response::notFound('لم يتم العثور على حساب الطبيب.');
        $doctorId = $doctor['id'];

        // Determine clinic_id (clinic_id is NOT NULL in schema)
        $clinicId = trim($data['clinic_id'] ?? '');
        if (empty($clinicId)) {
            $stmt = $pdo->prepare("SELECT clinic_id FROM clinicsdoctors WHERE doctor_id = ? AND UPPER(status) IN ('APPROVED','ACCEPTED') LIMIT 1");
            $stmt->execute([$doctorId]);
            $clinicId = $stmt->fetchColumn();
        }
        if (empty($clinicId)) {
            $stmt = $pdo->prepare("SELECT clinic_id FROM clinicsdoctors WHERE doctor_id = ? LIMIT 1");
            $stmt->execute([$doctorId]);
            $clinicId = $stmt->fetchColumn();
        }
        if (empty($clinicId)) {
            $stmt = $pdo->query("SELECT id FROM clinics LIMIT 1");
            $clinicId = $stmt->fetchColumn();
        }
        if (empty($clinicId)) {
            Response::error('يجب ربط الطبيب بعيادة أولاً لإضافة أسباب الاستشارة.', 422);
        }

        // Support bulk items or single item
        $items = [];
        if (!empty($data['items']) && is_array($data['items'])) {
            $items = $data['items'];
        } elseif (!empty($data['reasons']) && is_array($data['reasons'])) {
            $items = $data['reasons'];
        } elseif (!empty($data['reason_name'])) {
            $items = [$data];
        }

        if (empty($items)) {
            Response::error('يرجى تحديد أو إدخال سبب استشارة واحد على الأقل.', 422);
        }

        $checkStmt = $pdo->prepare("
            SELECT id FROM doctorsreasons 
            WHERE doctor_id = ? AND (reason_name = ? OR (reason_id IS NOT NULL AND reason_id = ?))
            LIMIT 1
        ");

        $insertStmt = $pdo->prepare("
            INSERT INTO doctorsreasons (id, reason_id, doctor_id, clinic_id, reason_name, reason_time, reason_color)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $inserted = [];
        $pdo->beginTransaction();
        try {
            foreach ($items as $item) {
                $reasonName = trim($item['reason_name'] ?? '');
                if (empty($reasonName)) continue;
                $reasonId = !empty($item['reason_id']) ? trim($item['reason_id']) : null;
                $reasonTime = isset($item['reason_time']) && (int)$item['reason_time'] > 0 
                    ? (int)$item['reason_time'] 
                    : (isset($data['reason_time']) && (int)$data['reason_time'] > 0 ? (int)$data['reason_time'] : 30);
                $reasonColor = isset($item['reason_color']) ? (int)$item['reason_color'] : 0;

                // Check duplicate
                $checkStmt->execute([$doctorId, $reasonName, $reasonId]);
                if ($checkStmt->fetch()) {
                    continue; // Skip if already exists for this doctor
                }

                $newId = UUIDHelper::generate();
                $insertStmt->execute([$newId, $reasonId, $doctorId, $clinicId, $reasonName, $reasonTime, $reasonColor]);
                $inserted[] = [
                    'id' => $newId,
                    'reason_id' => $reasonId,
                    'doctor_id' => $doctorId,
                    'clinic_id' => $clinicId,
                    'reason_name' => $reasonName,
                    'reason_time' => $reasonTime,
                    'reason_color' => $reasonColor
                ];
            }
            $pdo->commit();
        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::error('فشل في حفظ أسباب الاستشارة: ' . $e->getMessage(), 500);
        }

        Response::success([
            'count' => count($inserted),
            'items' => $inserted
        ], count($inserted) > 0 ? 'تمت إضافة أسباب الاستشارة بنجاح.' : 'جميع الأسباب المحددة مضافة بالفعل.');
    }

    // DELETE /api/doctors/reasons/{id}
    public static function deleteReason(string $id): void {
        $session = AuthMiddleware::authenticate();
        if ((int)$session['usertype'] !== 1) {
            Response::error('غير مسموح لك بالوصول.', 403);
        }

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctorId = $stmt->fetchColumn();
        if (!$doctorId) Response::notFound('لم يتم العثور على حساب الطبيب.');

        $stmt = $pdo->prepare("DELETE FROM doctorsreasons WHERE id = ? AND doctor_id = ?");
        $stmt->execute([$id, $doctorId]);

        if ($stmt->rowCount() === 0) {
            Response::notFound('لم يتم العثور على سبب الاستشارة أو ليس لديك صلاحية لحذفه.');
        }

        Response::success(null, 'تم حذف سبب الاستشارة بنجاح.');
    }
}
