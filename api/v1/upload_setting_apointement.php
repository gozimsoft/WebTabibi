<?php
// تفعيل وضع الأنواع الصارمة لتحسين الموثوقية
declare(strict_types=1);

header("Content-Type: application/json");
require_once("config.php");
require_once("auth.php");
require_once("controllers.php");

/*
// --- 1. التحقق من التوكن والمصادقة ---
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    send_json_response('fail', 'Token required', 401);
}
$token = trim(str_replace('Bearer', '', $headers['Authorization']));
$session = validateToken($token);
if (!$session) {
    send_json_response('fail', 'Invalid token', 401);
}
*/


// --- 2. الحصول على البيانات والتحقق منها ---
$data = json_decode(file_get_contents("php://input"), true) ?? [];

// التحقق من وجود البيانات الأساسية (id و doctor_id)
if (  empty($data['sdfg'])) {
    send_json_response('fail', 'doctor_id is required', 400);
}

// --- 3. تجهيز البيانات بالأنواع الصحيحة ---
// **تصحيح حاسم:** التعامل مع ID و Doctor_id كنصوص (string) وليس أرقام (int)
$id = generateUUIDv4()  ;
$doctor_id = (string)$data['doctor_id'];   
$time_scale = (int)($data['time_scale'] ?? 10);
$daytime_start = (string)($data['daytime_start'] ?? '08:00:00');
$daytime_end = (string)($data['daytime_end'] ?? '16:00:00');
$week_begin_day = (int)($data['week_begin_day'] ?? 0);
$working_days = (string)($data['working_days'] ?? '0000000');
$count_days = (int)($data['count_days'] ?? 1);
$is_registered = isset($data['IsRegistered']) && filter_var($data['IsRegistered'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;

try {
    // --- 4. التحقق من وجود سجل سابق للطبيب ---
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM DoctorsSettingApointements WHERE Doctor_id = :doctor_id");
    $stmt->execute([':doctor_id' => $doctor_id]);
    $exists = $stmt->fetchColumn() > 0;
    // --- 5. تجهيز وتنفيذ الاستعلام المناسب (UPDATE أو INSERT) ---
    if ($exists) {
        // جملة UPDATE تبقى كما هي، تستهدف السجل عبر Doctor_id
        $sql = "UPDATE DoctorsSettingApointements SET 
                    TimeScale = :time_scale,
                    DaytimeStart = :daytime_start, 
                    DaytimeEnd = :daytime_end,
                    WeekBeginDay = :week_begin_day,
                    WorkingDays = :working_days,
                    CountDays = :count_days,
                    IsRegistered = :is_registered
                WHERE Doctor_id = :doctor_id";        
        $params = [ 
            ':time_scale' => $time_scale,
            ':daytime_start' => $daytime_start,
            ':daytime_end' => $daytime_end,
            ':week_begin_day' => $week_begin_day,
            ':working_days' => $working_days,
            ':count_days' => $count_days,
            ':is_registered' => $is_registered,
            ':doctor_id' => $doctor_id
        ];

    } else {
        // **تصحيح حاسم:** إضافة حقل ID إلى جملة INSERT لأنه إجباري وليس تلقائيًا
        $sql = "INSERT INTO DoctorsSettingApointements 
                    (ID, Doctor_id, TimeScale, DaytimeStart, DaytimeEnd, WeekBeginDay, WorkingDays, CountDays, IsRegistered)
                VALUES 
                    (:id, :doctor_id, :time_scale, :daytime_start, :daytime_end, :week_begin_day, :working_days, :count_days, :is_registered)";
        
        $params = [
            ':id' => $id, // **مهم:** تم إضافة ID هنا
            ':doctor_id' => $doctor_id,
            ':time_scale' => $time_scale,
            ':daytime_start' => $daytime_start,
            ':daytime_end' => $daytime_end,
            ':week_begin_day' => $week_begin_day,
            ':working_days' => $working_days,
            ':count_days' => $count_days,
            ':is_registered' => $is_registered
        ];
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    send_json_response('success', 'Settings saved successfully');

} catch (PDOException $e) {
    // إذا استمر الخطأ، هذه الرسالة ستكشفه
    send_json_response('error', 'Database error: ' . $e->getMessage(), 500);
}

/**
 * دالة مساعدة لإرسال ردود JSON بشكل موحد
 */
function send_json_response(string $status, string $message, int $http_code = 200 ): void
{
    http_response_code($http_code );
    echo json_encode(['status' => $status, 'message' => $message]);
    exit;
}

?>
