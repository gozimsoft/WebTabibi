<?php
// ملف: register.php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $role = $_POST['role'];
    $phone = $_POST['phone'];

    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $password, $role, $phone]);

    $user_id = $pdo->lastInsertId();

    if ($role == 'doctor') {
        $specialty = $_POST['specialty'];
        $bio = $_POST['bio'];
        $address = $_POST['address'];

        $stmt = $pdo->prepare("INSERT INTO doctors (user_id, specialty, bio, address) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $specialty, $bio, $address]);
    }

    header('Location: login.php');
    exit();
}
?>

<form method="POST">
    <input name="name" placeholder="الاسم الكامل" required><br>
    <input name="email" type="email" placeholder="البريد الإلكتروني" required><br>
    <input name="password" type="password" placeholder="كلمة المرور" required><br>
    <input name="phone" placeholder="رقم الهاتف"><br>
    <select name="role" onchange="toggleDoctorFields(this.value)">
        <option value="patient">مريض</option>
        <option value="doctor">طبيب</option>
    </select><br>

    <div id="doctor_fields" style="display:none">
        <input name="specialty" placeholder="التخصص"><br>
        <input name="address" placeholder="العنوان"><br>
        <textarea name="bio" placeholder="السيرة الذاتية"></textarea><br>
    </div>

    <button type="submit">تسجيل</button>
</form>

<script>
function toggleDoctorFields(value) {
    document.getElementById('doctor_fields').style.display = value === 'doctor' ? 'block' : 'none';
}
</script>
