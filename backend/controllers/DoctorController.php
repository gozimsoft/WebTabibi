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
            Response::error('Non autorisé', 403);
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
        $doctor = $stmt->fetch();

        if (!$doctor) Response::notFound('Profil docteur non trouvé');
        
        if (!empty($doctor['photoprofile'])) {
            $doctor['photoprofile'] = base64_encode($doctor['photoprofile']);
        }

        Response::success($doctor);
    }

    // PUT /api/doctors/profile
    public static function updateProfile(): void {
        $session = AuthMiddleware::authenticate();
        if ($session['usertype'] != 1) {
            Response::error('Non autorisé', 403);
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
                Response::error("Nom d'utilisateur déjà pris", 409);
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
            $allowed = [
                'fullname', 'email', 'phone', 'fix', 'casnos', 'speakinglanguage', 
                'rpps', 'numregister', 'pricing', 'degrees', 'academytitles', 
                'postcode', 'specialtie_id'
            ];

            $fields = [];
            $values = [];
            foreach ($allowed as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "`$field` = ?";
                    $values[] = $data[$field];
                }
            }

            if (!empty($fields)) {
                $values[] = $doctor_id;
                $pdo->prepare("UPDATE doctors SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);
            }
        }

        Response::success(null, 'Profil mis à jour avec succès');
    }

    // POST /api/doctors/photo
    public static function uploadPhoto(): void {
        $session = AuthMiddleware::authenticate();
        if ($session['usertype'] != 1) {
            Response::error('Non autorisé', 403);
        }

        if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            Response::error('Erreur lors du téléchargement de la photo', 400);
        }

        $fileContent = file_get_contents($_FILES['photo']['tmp_name']);
        if (!$fileContent) {
            Response::error('Fichier vide ou invalide', 400);
        }

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctor_id = $stmt->fetchColumn();

        if (!$doctor_id) {
            Response::error('Profil non trouvé', 404);
        }

        $pdo->prepare("UPDATE doctors SET photoprofile = ? WHERE id = ?")
            ->execute([$fileContent, $doctor_id]);

        Response::success(null, 'Photo mise à jour avec succès');
    }

    // POST /api/doctors/upload  (Delphi desktop — doctor uploads own data)
    public static function uploadDoctor(): void {
        $session = AuthMiddleware::authenticate();
        if ((int)$session['usertype'] !== 1) Response::error('Non autorisé', 403);

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo  = Database::getInstance();

        // Get doctor_id from token
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $doctorId = $stmt->fetchColumn();
        if (!$doctorId) Response::notFound('Profil médecin non trouvé');

        $clinicId = trim($data['clinic_id'] ?? '');
        if (empty($clinicId)) Response::error('clinic_id est requis', 422);

        // Verify clinic exists
        $stmt = $pdo->prepare("SELECT id FROM clinics WHERE id = ? LIMIT 1");
        $stmt->execute([$clinicId]);
        if (!$stmt->fetchColumn()) Response::notFound('Clinique non trouvée');

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
            Response::success(['doctor_id'=>$doctorId,'clinic_id'=>$clinicId,'clinicsdoctor_id'=>$cdId], 'Données du médecin synchronisées avec succès');

        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('Erreur sync médecin: '.$e->getMessage());
        }
    }
}
