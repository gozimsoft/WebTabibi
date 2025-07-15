<?php
// ملف: book_appointment.php
require 'config.php';
require 'auth.php';
if (!isPatient()) die('غير مصرح');

$doctor_id = $_GET['doctor_id'] ?? null;
if (!$doctor_id) die('لم يتم تحديد الطبيب');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $date = $_POST['appointment_date'];
    $reason = $_POST['reason'];

    $stmt = $pdo->prepare("INSERT INTO appointments (doctor_id, patient_id, appointment_date, reason) VALUES (?, ?, ?, ?)");
    $stmt->execute([$doctor_id, $_SESSION['user_id'], $date, $reason]);
    echo "تم حجز الموعد بنجاح. <a href='dashboard_patient.php'>العودة</a>";
    exit();
}
?>

<h2>حجز موعد</h2>
<form method="POST">
    <label>تاريخ الموعد:</label><br>
    <input type="datetime-local" name="appointment_date" required><br>
    <label>سبب الزيارة:</label><br>
    <textarea name="reason" required></textarea><br>
    <button type="submit">تأكيد الحجز</button>
</form>
