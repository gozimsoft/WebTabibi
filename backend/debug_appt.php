<?php
// ================================================================
// debug_appt.php — اختبار endpoint المواعيد مباشرة (احذفه بعد الاختبار!)
// الاستخدام: https://domain.com/api/debug_appt.php?token=TOKEN_HERE
// ================================================================
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$token = trim($_GET['token'] ?? '');

if (!$token) {
    echo json_encode(['error' => 'أضف ?token=TOKEN_HERE في الرابط'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getInstance();

    // 1) التحقق من الـ token
    $stmt = $pdo->prepare("
        SELECT s.user_id, s.created_at, u.usertype, u.username
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ? LIMIT 1
    ");
    $stmt->execute([$token]);
    $session = $stmt->fetch();

    if (!$session) {
        echo json_encode(['step' => 'auth', 'error' => 'Token غير صالح أو منتهي'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $usertype = (int)$session['usertype'];
    $userId   = $session['user_id'];

    echo json_encode(['step' => 'auth_ok', 'usertype' => $usertype, 'user_id' => $userId], JSON_UNESCAPED_UNICODE);
    echo "\n";

    if ($usertype !== 1) {
        echo json_encode(['step' => 'check_type', 'error' => "usertype=$usertype وليس 1 (doctor). هذا هو سبب الخطأ!"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2) البحث عن الطبيب
    $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
    $stmt->execute([$userId]);
    $doctor = $stmt->fetch();

    if (!$doctor) {
        echo json_encode(['step' => 'doctor_lookup', 'error' => 'لا يوجد doctor بهذا user_id'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $doctorId = $doctor['id'];
    echo json_encode(['step' => 'doctor_ok', 'doctor_id' => $doctorId], JSON_UNESCAPED_UNICODE);
    echo "\n";

    // 3) جلب المواعيد
    $stmt = $pdo->prepare(
        "SELECT a.* FROM apointements a 
         JOIN clinicsdoctors cd ON cd.id = a.clinicsdoctor_id 
         WHERE cd.doctor_id = ? 
         ORDER BY a.apointementdate ASC"
    );
    $stmt->execute([$doctorId]);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'step'    => 'success',
        'count'   => count($appointments),
        'sample'  => array_slice($appointments, 0, 2),
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Throwable $e) {
    echo json_encode([
        'step'  => 'exception',
        'error' => $e->getMessage(),
        'file'  => $e->getFile(),
        'line'  => $e->getLine(),
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
