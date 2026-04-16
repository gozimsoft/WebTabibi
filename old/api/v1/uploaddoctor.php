<?php
header("Content-Type: application/json");
require_once("config.php");
require_once("controllers.php");

$data = json_decode(file_get_contents("php://input"), true);

// ── clinic ──────────────────────────────────────────────────────────────────
$clinic_id          = $data['clinic_id']        ?? '';
$clinicname         = $data['clinicname']        ?? '';
$clinic_phone       = $data['phone']             ?? '';
$clinic_fax         = $data['fax']               ?? '';
$clinic_address     = $data['address']           ?? '';
$clinic_email       = $data['email']             ?? '';
$clinic_website     = $data['website']           ?? '';
$clinic_typeclinic  = $data['typeclinic']        ?? '';
$cliniccoordinates  = $data['cliniccoordinates'] ?? '';
$clinic_activity    = $data['clinicactivity']    ?? '';
$clinic_latitude    = $data['cliniclatitude']    ?? 0;
$clinic_longitude   = $data['cliniclongitude']   ?? 0;
$clinic_postcode    = $data['clinicpostcode']    ?? 0;
$logoBase64         = $data['logo']              ?? null;
//
 
// ── user ─────────────────────────────────────────────────────────────────────
$user_id  = $data["user_id"]  ?? '';
$username = $data["username"] ?? '';
$password = $data["password"] ?? '';
$userType = $data["usertype"] ?? 1;
//

// ── doctor ───────────────────────────────────────────────────────────────────
$doctor_id         = $data['doctor_id']         ?? '';
$fullname          = $data['fullname']          ?? '';
$address           = $data['address']           ?? '';
$phone             = $data['phone']             ?? '';
$email             = $data['email']             ?? '';
$fax               = $data['fax']               ?? '';
$baladiya_id       = $data['baladiya_id']       ?? '';
$birthdate         = $data['birthdate']         ?? null;
$experience        = $data['experience']        ?? 0;
$specialtie_id     = $data['specialtie_id']     ?? '';
$payement_methods  = $data['payement_methods']  ?? '';
$activity_sector   = $data['activity_sector']   ?? '';
$education         = $data['education']         ?? '';
$presentation      = $data['presentation']      ?? '';
$cnas              = isset($data['cnas'])        && filter_var($data['cnas'],        FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$casnos            = isset($data['casnos'])      && filter_var($data['casnos'],      FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$speaking_language = $data['speaking_language'] ?? '';
$rpps              = $data['rpps']              ?? '';
$num_register      = $data['num_register']      ?? '';
$hide_rating       = isset($data['hide_rating']) && filter_var($data['hide_rating'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$pricing           = $data['pricing']           ?? 0;
$degrees           = $data['degrees']           ?? '';
$academy_titles    = $data['academy_titles']    ?? 0;
$fix               = $data['fix']               ?? '';
$postcode          = $data['postcode']          ?? 0;
$longitude         = $data['longitude']         ?? 0;
$latitude          = $data['latitude']          ?? 0;
$photoBase64       = $data['photo_profile']     ?? null;
//
// reasons
$reasons           = $data['reasons']           ?? [];   // مصفوفة من Reason_id
//
// offhours
$offhours          = $data['Offhour']           ?? [];   // مصفوفة من ساعات الغياب
//
// setting apointement
$time_scale        = $data['time_scale']        ?? 0;
$daytime_start     = $data['daytime_start']     ?? null;
$daytime_end       = $data['daytime_end']       ?? null;
$week_begin_day    = $data['week_begin_day']    ?? 0;
$working_days      = $data['working_days']      ?? '';
$count_days        = $data['count_days']        ?? 0;
$is_registered     = isset($data['is_registered']) && filter_var($data['is_registered'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
//


// ── التحقق من الحقول المطلوبة ────────────────────────────────────────────────
if (
    empty($user_id)    || empty($username)   || empty($password)  ||
    empty($doctor_id)  || empty($fullname)   || empty($phone)     ||
    empty($baladiya_id)|| empty($specialtie_id) ||
    empty($clinic_id)  || empty($clinicname)
) {
    echo json_encode([
        "status"  => "fail",
        "message" => "Missing required fields"
    ]);
    exit;
}
//

// ── التحقق من وجود السجلات قبل المعاملة ─────────────────────────────────────

$stmtUser = $pdo->prepare("SELECT COUNT(*) FROM Users WHERE ID = :id");
$stmtUser->execute([":id" => $user_id]);
$userExists = $stmtUser->fetchColumn() > 0;

$stmtDoc = $pdo->prepare("SELECT COUNT(*) FROM Doctors WHERE ID = :id");
$stmtDoc->execute([":id" => $doctor_id]);
$doctorExists = $stmtDoc->fetchColumn() > 0;

$stmtClinic = $pdo->prepare("SELECT COUNT(*) FROM Clinics WHERE ID = :id");
$stmtClinic->execute([":id" => $clinic_id]);
$clinicExists = $stmtClinic->fetchColumn() > 0;

// ── بدء المعاملة ─────────────────────────────────────────────────────────────
$pdo->beginTransaction();

try {

    // ══════════════════════════════════════════════════════════════════════════
    //  1) المستخدم  (Users)
    // ══════════════════════════════════════════════════════════════════════════
    if (!$userExists) {
        $stmtU = $pdo->prepare("
            INSERT INTO Users (ID, Username, Password, UserType)
            VALUES (:id, :username, :password, :usertype)
        ");
    } else {
        $stmtU = $pdo->prepare("
            UPDATE Users
            SET Username = :username,
                Password = :password,
                UserType = :usertype
            WHERE ID = :id
        ");
    }
    $stmtU->execute([
        ":id"       => $user_id,
        ":username" => $username,
        ":password" => xorEncrypt($password),
        ":usertype" => $userType
    ]);

    // ══════════════════════════════════════════════════════════════════════════
    //  2) الطبيب  (Doctors)
    // ══════════════════════════════════════════════════════════════════════════
    $doctorParams = [
        ":user_id"           => $user_id,
        ":fullname"          => $fullname,
        ":address"           => $address,
        ":phone"             => $phone,
        ":email"             => $email,
        ":fax"               => $fax,
        ":baladiya_id"       => $baladiya_id,
        ":birthdate"         => $birthdate,
        ":experience"        => $experience,
        ":specialtie_id"     => $specialtie_id,
        ":payement_methods"  => $payement_methods,
        ":activity_sector"   => $activity_sector,
        ":education"         => $education,
        ":presentation"      => $presentation,
        ":cnas"              => $cnas,
        ":casnos"            => $casnos,
        ":speaking_language" => $speaking_language,
        ":rpps"              => $rpps,
        ":num_register"      => $num_register,
        ":hide_rating"       => $hide_rating,
        ":pricing"           => $pricing,
        ":degrees"           => $degrees,
        ":academy_titles"    => $academy_titles,
        ":fix"               => $fix,
        ":postcode"          => $postcode,
        ":longitude"         => $longitude,
        ":latitude"          => $latitude,
        ":doctor_id"         => $doctor_id
    ];

    if (!$doctorExists) {
        $stmtD = $pdo->prepare("
            INSERT INTO Doctors (
                ID, User_id, FullName, Address, Phone, Email, Fax,
                Baladiya_id, BirthDate, Experience, Specialtie_id, PayementMethods,
                ActivitySector, Education, Presentation, Cnas, Casnos, SpeakingLanguage,
                RPPS, NumRegister, HideRating, Pricing, Degrees, AcademyTitles,
                Fix, PostCode, Longitude, Latitude
            ) VALUES (
                :doctor_id, :user_id, :fullname, :address, :phone, :email, :fax,
                :baladiya_id, :birthdate, :experience, :specialtie_id, :payement_methods,
                :activity_sector, :education, :presentation, :cnas, :casnos, :speaking_language,
                :rpps, :num_register, :hide_rating, :pricing, :degrees, :academy_titles,
                :fix, :postcode, :longitude, :latitude
            )
        ");
    } else {
        $stmtD = $pdo->prepare("
            UPDATE Doctors SET
                User_id          = :user_id,
                FullName         = :fullname,
                Address          = :address,
                Phone            = :phone,
                Email            = :email,
                Fax              = :fax,
                Baladiya_id      = :baladiya_id,
                BirthDate        = :birthdate,
                Experience       = :experience,
                Specialtie_id    = :specialtie_id,
                PayementMethods  = :payement_methods,
                ActivitySector   = :activity_sector,
                Education        = :education,
                Presentation     = :presentation,
                Cnas             = :cnas,
                Casnos           = :casnos,
                SpeakingLanguage = :speaking_language,
                RPPS             = :rpps,
                NumRegister      = :num_register,
                HideRating       = :hide_rating,
                Pricing          = :pricing,
                Degrees          = :degrees,
                AcademyTitles    = :academy_titles,
                Fix              = :fix,
                PostCode         = :postcode,
                Longitude        = :longitude,
                Latitude         = :latitude
            WHERE ID = :doctor_id
        ");
    }
    $stmtD->execute($doctorParams);

    // ══════════════════════════════════════════════════════════════════════════
    //  3) صورة الملف الشخصي للطبيب (اختياري)
    // ══════════════════════════════════════════════════════════════════════════
    if (!empty($photoBase64)) {
        $blob      = base64_decode($photoBase64);
        $stmtPhoto = $pdo->prepare("UPDATE Doctors SET PhotoProfile = :photo WHERE ID = :id");
        $stmtPhoto->bindParam(':id',    $doctor_id);
        $stmtPhoto->bindParam(':photo', $blob, PDO::PARAM_LOB);
        $stmtPhoto->execute();
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  4) العيادة  (Clinics)
    // ══════════════════════════════════════════════════════════════════════════
  $clinicParams = [
        ':clinic_id'         => $clinic_id,
        ':clinicname'        => $clinicname,
        ':clinic_phone'      => $clinic_phone,
        ':clinic_fax'        => $clinic_fax,
        ':clinic_address'    => $clinic_address,
        ':clinic_email'      => $clinic_email,
        ':clinic_website'    => $clinic_website,
        ':clinic_typeclinic' => $clinic_typeclinic,
        ':cliniccoordinates' => $cliniccoordinates,
        ':clinic_activity'   => $clinic_activity,
        ':clinic_latitude'   => $clinic_latitude,
        ':clinic_longitude'  => $clinic_longitude,
        ':clinic_postcode'   => $clinic_postcode,
    ];

    if (!$clinicExists) {
        // إنشاء عيادة جديدة
        $stmtC = $pdo->prepare("
            INSERT INTO Clinics (
                ID, ClinicName, Phone, Fax, Address, Email, Website,
                ActivitySector, ClinicCoordinates, Latitude, Longitude, PostCode,TypeClinic
            ) VALUES (
                :clinic_id, :clinicname, :clinic_phone, :clinic_fax, :clinic_address,
                :clinic_email, :clinic_website,
                :clinic_activity, :cliniccoordinates, :clinic_latitude, :clinic_longitude, :clinic_postcode,:clinic_typeclinic  
            )
        ");
    } else {
        // تحديث بيانات العيادة الموجودة
        $stmtC = $pdo->prepare("
            UPDATE Clinics SET
                ClinicName        = :clinicname,
                Phone             = :clinic_phone,
                Fax               = :clinic_fax,
                Address           = :clinic_address,
                Email             = :clinic_email,
                Website           = :clinic_website,
                ActivitySector    = :clinic_activity,
                ClinicCoordinates = :cliniccoordinates,
                Latitude          = :clinic_latitude,
                Longitude         = :clinic_longitude,
                PostCode          = :clinic_postcode,
                TypeClinic        = :clinic_typeclinic
            WHERE ID = :clinic_id
        ");
    }
    $stmtC->execute($clinicParams);
 
    // ══════════════════════════════════════════════════════════════════════════
    //  5) ربط الطبيب بالعيادة  (ClinicsDoctors)
    // ══════════════════════════════════════════════════════════════════════════
    $stmtLink = $pdo->prepare("
        SELECT COUNT(*) FROM ClinicsDoctors
        WHERE Clinic_ID = :clinic_id AND Doctor_ID = :doctor_id
    ");
    $stmtLink->execute([':clinic_id' => $clinic_id, ':doctor_id' => $doctor_id]);
    $linkExists = $stmtLink->fetchColumn() > 0;

    if (!$linkExists) {
        // إدراج ربط جديد مع التخصص
        $stmtInsertLink = $pdo->prepare("
            INSERT INTO ClinicsDoctors (ID, Clinic_ID, Doctor_ID, Specialtie_id)
            VALUES (:id, :clinic_id, :doctor_id, :specialtie_id)
        ");
        $stmtInsertLink->execute([
            ':id'           => generateUUIDv4(),
            ':clinic_id'    => $clinic_id,
            ':doctor_id'    => $doctor_id,
            ':specialtie_id'=> $specialtie_id,
        ]);
    } else {
        // تحديث التخصص إذا تغيّر
        $stmtUpdateLink = $pdo->prepare("
            UPDATE ClinicsDoctors
            SET Specialtie_id = :specialtie_id
            WHERE Clinic_ID = :clinic_id AND Doctor_ID = :doctor_id
        ");
        $stmtUpdateLink->execute([
            ':specialtie_id'=> $specialtie_id,
            ':clinic_id'    => $clinic_id,
            ':doctor_id'    => $doctor_id,
        ]);
    }
 
    // ══════════════════════════════════════════════════════════════════════════
    //  6) أسباب الزيارة  (DoctorsReasons)
    // ══════════════════════════════════════════════════════════════════════════
    if (!empty($reasons) && is_array($reasons)) {
        // حذف الأسباب القديمة أولاً
        $stmtDelReasons = $pdo->prepare("
            DELETE FROM DoctorsReasons
            WHERE Doctor_id = :doctor_id AND Clinic_id = :clinic_id
        ");
        $stmtDelReasons->execute([':doctor_id' => $doctor_id, ':clinic_id' => $clinic_id]);

        // إدراج الأسباب الجديدة مع الحقول المُعدَّلة
        $stmtInsertReason = $pdo->prepare("
            INSERT INTO DoctorsReasons
                (ID, Reason_id, Doctor_id, Clinic_id, reason_name, reason_color, reason_count, reason_time)
            VALUES
                (:id, :reason_id, :doctor_id, :clinic_id, :reason_name, :reason_color, :reason_count, :reason_time)
        ");
        foreach ($reasons as $item) {
            if (!empty($item)) {
                $stmtInsertReason->execute([
                    ':id'           => generateUUIDv4(),
                    ':reason_id'    => $item['reason_id'],
                    ':doctor_id'    => $doctor_id,
                    ':clinic_id'    => $clinic_id,
                    ':reason_name'  => $item['reason_name']  ?? '',
                    ':reason_color' => $item['reason_color'] ?? 0,
                    ':reason_count' => $item['reason_count'] ?? 0,
                    ':reason_time'  => $item['reason_time']  ?? 0,
                ]);
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  7) ساعات الغياب  (DoctorsOffHours)
    // ══════════════════════════════════════════════════════════════════════════
    if (!empty($offhours) && is_array($offhours)) {
        // حذف السجلات القديمة لهذا الطبيب في هذه العيادة
        $stmtDelOff = $pdo->prepare("
            DELETE FROM DoctorsOffHours
            WHERE Doctor_id = :doctor_id AND Clinic_id = :clinic_id
        ");
        $stmtDelOff->execute([':doctor_id' => $doctor_id, ':clinic_id' => $clinic_id]);

        // إدراج السجلات الجديدة
        $stmtInsertOff = $pdo->prepare("
            INSERT INTO DoctorsOffHours (ID, Day, TimeBegin, TimeEnd, Doctor_id, Clinic_id)
            VALUES (:id, :day, :time_begin, :time_end, :doctor_id, :clinic_id)
        ");
        foreach ($offhours as $oh) {
            if (!empty($oh)) {
                $stmtInsertOff->execute([
                    ':id'        => generateUUIDv4(),
                    ':day'       => $oh['day'],
                    ':time_begin'=> $oh['time_begin'],
                    ':time_end'  => $oh['time_end'],
                    ':doctor_id' => $doctor_id,
                    ':clinic_id' => $clinic_id,
                ]);
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  8) إعدادات المواعيد  (DoctorsSettingApointements)
    // ══════════════════════════════════════════════════════════════════════════
    $stmtCheckSetting = $pdo->prepare("
        SELECT COUNT(*) FROM DoctorsSettingApointements
        WHERE Doctor_id = :doctor_id AND Clinic_id = :clinic_id
    ");
    $stmtCheckSetting->execute([':doctor_id' => $doctor_id, ':clinic_id' => $clinic_id]);
    $settingExists = $stmtCheckSetting->fetchColumn() > 0;

    if (!$settingExists) {
        // إنشاء سجل إعدادات جديد
        $stmtSetting = $pdo->prepare("
            INSERT INTO DoctorsSettingApointements
                (ID, TimeScale, DaytimeStart, DaytimeEnd, WeekBeginDay,
                 WorkingDays, Doctor_id, CountDays, IsRegistered, Clinic_id)
            VALUES
                (:id, :time_scale, :daytime_start, :daytime_end, :week_begin_day,
                 :working_days, :doctor_id, :count_days, :is_registered, :clinic_id)
        ");
        $stmtSetting->execute([
            ':id'            => generateUUIDv4(),
            ':time_scale'    => $time_scale,
            ':daytime_start' => $daytime_start,
            ':daytime_end'   => $daytime_end,
            ':week_begin_day'=> $week_begin_day,
            ':working_days'  => $working_days,
            ':doctor_id'     => $doctor_id,
            ':count_days'    => $count_days,
            ':is_registered' => $is_registered,
            ':clinic_id'     => $clinic_id,
        ]);
    } else {
        // تحديث إعدادات المواعيد الموجودة
        $stmtSetting = $pdo->prepare("
            UPDATE DoctorsSettingApointements SET
                TimeScale    = :time_scale,
                DaytimeStart = :daytime_start,
                DaytimeEnd   = :daytime_end,
                WeekBeginDay = :week_begin_day,
                WorkingDays  = :working_days,
                CountDays    = :count_days,
                IsRegistered = :is_registered
            WHERE Doctor_id = :doctor_id AND Clinic_id = :clinic_id
        ");
        $stmtSetting->execute([
            ':time_scale'    => $time_scale,
            ':daytime_start' => $daytime_start,
            ':daytime_end'   => $daytime_end,
            ':week_begin_day'=> $week_begin_day,
            ':working_days'  => $working_days,
            ':count_days'    => $count_days,
            ':is_registered' => $is_registered,
            ':doctor_id'     => $doctor_id,
            ':clinic_id'     => $clinic_id,
        ]);
    }

    // ── تأكيد المعاملة ───────────────────────────────────────────────────────
    $pdo->commit();

    // حفظ شعار العيادة بعد commit (BLOB)
    if (!empty($logoBase64)) {
        $logoBlob = base64_decode($logoBase64);
        $stmtLogo = $pdo->prepare("UPDATE Clinics SET Logo = :logo WHERE ID = :id");
        $stmtLogo->bindParam(':id',   $clinic_id);
        $stmtLogo->bindParam(':logo', $logoBlob, PDO::PARAM_LOB);
        $stmtLogo->execute();
    }

    $action = (!$userExists && !$doctorExists) ? "created" :
              (!$doctorExists ? "user updated, doctor created" : "updated");

    echo json_encode([
        "status"    => "success",
        "message"   => "Doctor data saved successfully ($action)",
        "user_id"   => $user_id,
        "doctor_id" => $doctor_id,
        "clinic_id" => $clinic_id
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        "status"  => "fail",
        "message" => "Operation failed: " . $e->getMessage()
    ]);
}
