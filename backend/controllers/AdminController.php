<?php
// ============================================================
// controllers/AdminController.php  —  usertype = 3
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';

class AdminController {

    // ----------------------------------------------------------
    // GET /api/admin/stats
    // Returns platform-wide statistics
    // ----------------------------------------------------------
    public static function stats(): void {
        AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();

        $stats = [];

        // clinics
        $r = $pdo->query("SELECT COUNT(*) FROM clinics")->fetchColumn();
        $stats['total_clinics'] = (int)$r;

        // doctors
        $r = $pdo->query("SELECT COUNT(*) FROM doctors")->fetchColumn();
        $stats['total_doctors'] = (int)$r;

        // patients
        $r = $pdo->query("SELECT COUNT(*) FROM patients")->fetchColumn();
        $stats['total_patients'] = (int)$r;

        // Appointments
        $r = $pdo->query("SELECT COUNT(*) FROM apointements")->fetchColumn();
        $stats['total_appointments'] = (int)$r;

        // Today's appointments
        $r = $pdo->query("SELECT COUNT(*) FROM apointements WHERE DATE(apointementdate) = CURDATE()")->fetchColumn();
        $stats['today_appointments'] = (int)$r;

        // This month's appointments
        $r = $pdo->query("SELECT COUNT(*) FROM apointements WHERE YEAR(apointementdate)=YEAR(NOW()) AND MONTH(apointementdate)=MONTH(NOW())")->fetchColumn();
        $stats['month_appointments'] = (int)$r;

        // Pending clinic registrations
        $r = $pdo->query("SELECT COUNT(*) FROM clinicregistrations WHERE status='PENDING'")->fetchColumn();
        $stats['pending_clinics'] = (int)$r;

        // Pending doctor registrations
        $r = $pdo->query("SELECT COUNT(*) FROM doctorregistrations WHERE status='PENDING'")->fetchColumn();
        $stats['pending_doctors'] = (int)$r;

        // Monthly clinic growth (last 6 months)
        $stmt = $pdo->query("
            SELECT DATE_FORMAT(createdat,'%Y-%m') as month, COUNT(*) as count
            FROM clinicregistrations
            WHERE createdat >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month ORDER BY month ASC
        ");
        $stats['clinic_growth'] = $stmt->fetchAll();

        // Monthly appointment trend (last 6 months)
        $stmt = $pdo->query("
            SELECT DATE_FORMAT(apointementdate,'%Y-%m') as month, COUNT(*) as count
            FROM apointements
            WHERE apointementdate >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month ORDER BY month ASC
        ");
        $stats['appointment_trend'] = $stmt->fetchAll();

        // ------------------
        // Visit Statistics
        // ------------------
        
        // Ensure table exists just in case admin accesses before any visits
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS site_visits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip_address VARCHAR(45) NOT NULL,
                country VARCHAR(100) DEFAULT 'Unknown',
                wilaya VARCHAR(100) DEFAULT 'Unknown',
                visit_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_visit (ip_address, visit_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $stats['visits_today'] = (int)$pdo->query("SELECT COUNT(*) FROM site_visits WHERE visit_date = CURDATE()")->fetchColumn();
        $stats['visits_weekly'] = (int)$pdo->query("SELECT COUNT(*) FROM site_visits WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)")->fetchColumn();
        $stats['visits_monthly'] = (int)$pdo->query("SELECT COUNT(*) FROM site_visits WHERE YEAR(visit_date) = YEAR(CURDATE()) AND MONTH(visit_date) = MONTH(CURDATE())")->fetchColumn();
        $stats['visits_total'] = (int)$pdo->query("SELECT COUNT(*) FROM site_visits")->fetchColumn();
        
        $stats['visits_by_country'] = $pdo->query("SELECT country, COUNT(*) as count FROM site_visits GROUP BY country ORDER BY count DESC")->fetchAll();
        $stats['visits_by_wilaya'] = $pdo->query("SELECT wilaya, COUNT(*) as count FROM site_visits GROUP BY wilaya ORDER BY count DESC")->fetchAll();

        Response::success($stats);
    }

    // ----------------------------------------------------------
    // GET /api/admin/clinics?status=PENDING&page=1
    // ----------------------------------------------------------
    public static function listClinics(): void {
        AuthMiddleware::adminOnly();
        $pdo    = Database::getInstance();
        $status = $_GET['status'] ?? 'PENDING';
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = 20;
        $offset = ($page - 1) * $limit;

        $allowed = ['PENDING','APPROVED','REJECTED'];
        if (!in_array($status, $allowed)) $status = 'PENDING';

        $total = $pdo->prepare("SELECT COUNT(*) FROM clinicregistrations WHERE status=?");
        $total->execute([$status]);
        $total = (int)$total->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT id, clinicname, email, phone, address, notes, status, rejectedreason, approvedat, createdat
            FROM clinicregistrations
            WHERE status=?
            ORDER BY createdat DESC
            LIMIT $limit OFFSET $offset
        ");
        $stmt->execute([$status]);
        $items = $stmt->fetchAll();

        Response::success([
            'items'       => $items,
            'total'       => $total,
            'page'        => $page,
            'total_pages' => max(1, ceil($total / $limit)),
        ]);
    }

    // ----------------------------------------------------------
    // GET /api/admin/doctors?status=PENDING&page=1
    // ----------------------------------------------------------
    public static function listDoctors(): void {
        AuthMiddleware::adminOnly();
        $pdo    = Database::getInstance();
        $status = $_GET['status'] ?? 'PENDING';
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = 20;
        $offset = ($page - 1) * $limit;

        $allowed = ['PENDING','APPROVED','REJECTED'];
        if (!in_array($status, $allowed)) $status = 'PENDING';

        $total = $pdo->prepare("SELECT COUNT(*) FROM doctorregistrations WHERE status=?");
        $total->execute([$status]);
        $total = (int)$total->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT id, fullname, speciality, email, phone, clinicname, status, rejectedreason, approvedat, createdat
            FROM doctorregistrations
            WHERE status=?
            ORDER BY createdat DESC
            LIMIT $limit OFFSET $offset
        ");
        $stmt->execute([$status]);
        $items = $stmt->fetchAll();

        Response::success([
            'items'       => $items,
            'total'       => $total,
            'page'        => $page,
            'total_pages' => max(1, ceil($total / $limit)),
        ]);
    }

    // ----------------------------------------------------------
    // POST /api/admin/clinics/{id}/approve
    // Approves clinic registration → creates clinics + users rows
    // ----------------------------------------------------------
    public static function approveClinic(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT * FROM clinicregistrations WHERE id=? LIMIT 1");
        $stmt->execute([$id]);
        $reg = $stmt->fetch();

        if (!$reg) Response::notFound('الطلب غير موجود.');
        if ($reg['status'] !== 'PENDING') Response::error('تمت معالجة هذا الطلب بالفعل.', 409);

        $pdo->beginTransaction();
        try {
            $userId   = UUIDHelper::generate();
            $clinicid = UUIDHelper::generate();

            // Create User (usertype=2 = Clinic)
            $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,2)")
                ->execute([$userId, strtolower(str_replace(' ', '_', $reg['clinicname'])) . '_' . substr($id, 0, 6), $reg['password']]);

            // Create Clinic record
            $pdo->prepare("
                INSERT INTO clinics (id, clinicname, phone, email, address, status, approvedat, user_id)
                VALUES (?,?,?,?,?,  'APPROVED', NOW(), ?)
            ")->execute([$clinicid, $reg['clinicname'], $reg['phone'], $reg['email'], $reg['address'], $userId]);

            // Update registration record
            $pdo->prepare("
                UPDATE clinicregistrations
                SET status='APPROVED', approvedat=NOW(), clinic_id=?, user_id=?
                WHERE id=?
            ")->execute([$clinicid, $userId, $id]);

            $pdo->commit();

            Response::success([
                'clinic_id' => $clinicid,
                'user_id'   => $userId,
            ], 'تمت الموافقة على العيادة بنجاح.');

        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('حدث خطأ في الخادم أثناء معالجة الموافقة.');
        }
    }

    // ----------------------------------------------------------
    // POST /api/admin/clinics/{id}/reject
    // Body: { reason: string }
    // ----------------------------------------------------------
    public static function rejectClinic(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo  = Database::getInstance();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $stmt = $pdo->prepare("SELECT status FROM clinicregistrations WHERE id=? LIMIT 1");
        $stmt->execute([$id]);
        $reg = $stmt->fetch();

        if (!$reg) Response::notFound('الطلب غير موجود.');
        if ($reg['status'] !== 'PENDING') Response::error('تمت معالجة هذا الطلب بالفعل.', 409);

        $pdo->prepare("
            UPDATE clinicregistrations
            SET status='REJECTED', rejectedreason=?
            WHERE id=?
        ")->execute([$data['reason'] ?? null, $id]);

        Response::success(null, 'تم رفض طلب العيادة.');
    }

    // ----------------------------------------------------------
    // POST /api/admin/doctors/{id}/approve
    // ----------------------------------------------------------
    public static function approveDoctor(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT * FROM doctorregistrations WHERE id=? LIMIT 1");
        $stmt->execute([$id]);
        $reg = $stmt->fetch();

        if (!$reg) Response::notFound('الطلب غير موجود.');
        if ($reg['status'] !== 'PENDING') Response::error('تمت معالجة هذا الطلب بالفعل.', 409);

        $pdo->beginTransaction();
        try {
            $isVirtualClaim = !empty($reg['doctor_id']);
            $doctorIdToUse  = $isVirtualClaim ? $reg['doctor_id'] : UUIDHelper::generate();
            $userId         = UUIDHelper::generate();
            $username       = strtolower(str_replace(' ', '_', $reg['fullname'])) . '_' . substr($id, 0, 6);
            $plainPassword  = base64_decode($reg['password']) ?: '123456';

            if ($isVirtualClaim) {
                // Fetch the existing virtual doctor to see if they already have a user_id
                $stmtDoc = $pdo->prepare("SELECT user_id FROM doctors WHERE id=?");
                $stmtDoc->execute([$doctorIdToUse]);
                $existingDoc = $stmtDoc->fetch();

                if ($existingDoc && !empty($existingDoc['user_id'])) {
                    $userId = $existingDoc['user_id'];
                    // Update existing user credentials
                    $pdo->prepare("UPDATE users SET username=?, password=? WHERE id=?")
                        ->execute([$username, $reg['password'], $userId]);
                } else {
                    // Create new user for this virtual doctor
                    $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,1)")
                        ->execute([$userId, $username, $reg['password']]);
                }

                // Update the existing virtual doctor profile
                $pdo->prepare("
                    UPDATE doctors 
                    SET fullname=?, phone=?, email=?, emailvalidation=1, user_id=?, status='APPROVED', approvedat=NOW()
                    WHERE id=?
                ")->execute([$reg['fullname'], $reg['phone'], $reg['email'], $userId, $doctorIdToUse]);

            } else {
                // Completely new doctor
                $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,1)")
                    ->execute([$userId, $username, $reg['password']]);

                $pdo->prepare("
                    INSERT INTO doctors (id, fullname, phone, email, emailvalidation, status, approvedat, user_id)
                    VALUES (?,?,?,?, 1, 'APPROVED', NOW(), ?)
                ")->execute([$doctorIdToUse, $reg['fullname'], $reg['phone'], $reg['email'], $userId]);
            }

            // Update registration status
            $pdo->prepare("
                UPDATE doctorregistrations
                SET status='APPROVED', approvedat=NOW(), doctor_id=?, user_id=?
                WHERE id=?
            ")->execute([$doctorIdToUse, $userId, $id]);

            $pdo->commit();

            // Send credentials to email
            $subject = "✅ طلب الانضمام مقبول - طبيبي";
            $body = "<p>مرحباً <strong>{$reg['fullname']}</strong>،</p>
                     <p>لقد تمت الموافقة على طلبك بنجاح! يمكنك الآن تسجيل الدخول إلى حسابك باستخدام التفاصيل التالية:</p>
                     <ul>
                        <li><strong>اسم المستخدم (Username):</strong> $username</li>
                        <li><strong>كلمة المرور:</strong> $plainPassword</li>
                     </ul>
                     <p>شكراً لانضمامك إلينا.</p>";
            $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: no-reply@webtabibi.com\r\n";
            @mail($reg['email'], $subject, $body, $headers);

            Response::success([
                'doctor_id' => $doctorIdToUse,
                'user_id'   => $userId,
                'username'  => $username,
            ], 'تمت الموافقة على الطبيب بنجاح وتم إرسال معلومات الدخول.');

        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('حدث خطأ في الخادم أثناء معالجة الموافقة.');
        }
    }

    // ----------------------------------------------------------
    // POST /api/admin/doctors/{id}/reject
    // Body: { reason: string }
    // ----------------------------------------------------------
    public static function rejectDoctor(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo  = Database::getInstance();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $stmt = $pdo->prepare("SELECT status FROM doctorregistrations WHERE id=? LIMIT 1");
        $stmt->execute([$id]);
        $reg = $stmt->fetch();

        if (!$reg) Response::notFound('الطلب غير موجود.');
        if ($reg['status'] !== 'PENDING') Response::error('تمت معالجة هذا الطلب بالفعل.', 409);

        $pdo->prepare("
            UPDATE doctorregistrations
            SET status='REJECTED', rejectedreason=?
            WHERE id=?
        ")->execute([$data['reason'] ?? null, $id]);

        Response::success(null, 'تم رفض طلب الطبيب.');
    }
}
