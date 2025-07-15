<?php
header("Content-Type: application/json");

require_once("config.php");
require_once("auth.php");

// ✅ قراءة التوكن من الهيدر
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['status' => 'fail', 'message' => 'Unauthorized - Token missing']);
    exit;
}
$token = $matches[1];

// ✅ التحقق من التوكن باستخدام الدالة من auth.php
$session = validateToken($token);
if (!$session) {
    http_response_code(401);
    echo json_encode(['status' => 'fail', 'message' => 'Invalid token']);
    exit;
}

$user_id = $session['user_id']; // ✅ هذا المستخدم المسجل في الجلسة

// ✅ استقبال البيانات من JSON
$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? '';
$fullname = $data['fullname'] ?? '';
$address = $data['address'] ?? '';
$phone = $data['phone'] ?? '';
$email = $data['email'] ?? '';
$fax = $data['fax'] ?? '';
$baladiya_id = $data['baladiya_id'] ?? '';
$birthdate = $data['birthdate'] ?? null;
$experience = $data['experience'] ?? 0;
$specialtie_id = $data['specialtie_id'] ?? '';
$payement_methods = $data['payement_methods'] ?? '';
$activity_sector = $data['activity_sector'] ?? '';
$education = $data['education'] ?? '';
$presentation = $data['presentation'] ?? '';
$cnas = isset($data['cnas']) && filter_var($data['cnas'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$casnos = isset($data['casnos']) && filter_var($data['casnos'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$speaking_language = $data['speaking_language'] ?? '';
$rpps = $data['rpps'] ?? '';
$num_register = $data['num_register'] ?? '';
$hide_rating = isset($data['hide_rating']) && filter_var($data['hide_rating'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$pricing = $data['pricing'] ?? 0;
$degrees = $data['degrees'] ?? '';
$academy_titles = $data['academy_titles'] ?? 0;
$fix = $data['fix'] ?? '';
$postcode = $data['postcode'] ?? 0;
$longitude = $data['longitude'] ?? 0;
$latitude = $data['latitude'] ?? 0;
$photoBase64 = $data['photo_profile'] ?? null;

// تحقق من ID
if (empty($id)) {
    echo json_encode(['status' => 'fail', 'message' => 'Missing doctor ID']);
    exit;
}

// تحقق هل الطبيب موجود
$stmt = $pdo->prepare("SELECT COUNT(*) FROM Doctors WHERE ID = :id");
$stmt->execute([':id' => $id]);
$exists = $stmt->fetchColumn() > 0;

if ($exists) {
    // تحديث
    $sql = "
        UPDATE Doctors SET 
            User_id = :user_id,
            Baladiya_id = :baladiya_id,
            Specialtie_id = :specialtie_id,
            FullName = :fullname,
            Address = :address,
            Phone = :phone,
            Email = :email,
            Fax = :fax,
            PayementMethods = :payement_methods,
            ActivitySector = :activity_sector,
            Education = :education,
            Presentation = :presentation,
            RPPS = :rpps,
            Pricing = :pricing,
            Degrees = :degrees,
            Fix = :fix,
            Postcode = :postcode,
            Longitude = :longitude,
            Latitude = :latitude,
            BirthDate = :birthdate,
            Experience = :experience,
            Cnas = :cnas,
            Casnos = :casnos,
            HideRating = :hide_rating,
            SpeakingLanguage = :speaking_language,
            NumRegister = :num_register,
            AcademyTitles = :academy_titles
        WHERE ID = :id
    ";
} else {
    // إدراج
    $sql = "
        INSERT INTO Doctors (
            ID, User_id, FullName, Address, Phone, Email, Fax,
            Baladiya_id, BirthDate, Experience, Specialtie_id, PayementMethods,
            ActivitySector, Education, Presentation, Cnas, Casnos, SpeakingLanguage,
            RPPS, NumRegister, HideRating, Pricing, Degrees, AcademyTitles,
            Fix, PostCode, Longitude, Latitude
        ) VALUES (
            :id, :user_id, :fullname, :address, :phone, :email, :fax,
            :baladiya_id, :birthdate, :experience, :specialtie_id, :payement_methods,
            :activity_sector, :education, :presentation, :cnas, :casnos, :speaking_language,
            :rpps, :num_register, :hide_rating, :pricing, :degrees, :academy_titles,
            :fix, :postcode, :longitude, :latitude
        )
    ";
}

// تنفيذ الاستعلام
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':id' => $id,
    ':user_id' => $user_id,
    ':specialtie_id' => $specialtie_id,
    ':baladiya_id' => $baladiya_id,
    ':fullname' => $fullname,
    ':address' => $address,
    ':phone' => $phone,
    ':email' => $email,
    ':fax' => $fax,
    ':experience' => $experience,
    ':payement_methods' => $payement_methods,
    ':activity_sector' => $activity_sector,
    ':education' => $education,
    ':presentation' => $presentation,
    ':cnas' => $cnas,
    ':casnos' => $casnos,
    ':speaking_language' => $speaking_language,
    ':rpps' => $rpps,
    ':num_register' => $num_register,
    ':hide_rating' => $hide_rating,
    ':pricing' => $pricing,
    ':degrees' => $degrees,
    ':academy_titles' => $academy_titles,
    ':fix' => $fix,
    ':postcode' => $postcode,
    ':longitude' => $longitude,
    ':latitude' => $latitude,
    ':birthdate' => $birthdate
]);

// حفظ الصورة
if ($photoBase64) {
    $blob = base64_decode($photoBase64);
    $stmt = $pdo->prepare("UPDATE Doctors SET PhotoProfile = :photo WHERE ID = :id");
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':photo', $blob, PDO::PARAM_LOB);
    $stmt->execute();
}

// الرد
echo json_encode(['status' => 'success', 'message' => 'Doctor data uploaded']);
?>
