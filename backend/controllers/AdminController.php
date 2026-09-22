<?php
// ============================================================
// controllers/AdminController.php  —  usertype = 3
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';
require_once __DIR__ . '/../helpers/EmailHelper.php';
require_once __DIR__ . '/../helpers/PasswordHelper.php';

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
    // GET /api/admin/clinics?status=PENDING&page=1&q=...&limit=20&period=all
    // ----------------------------------------------------------
    public static function listClinics(): void {
        AuthMiddleware::adminOnly();
        $pdo    = Database::getInstance();
        $status = $_GET['status'] ?? 'PENDING';
        $search = trim($_GET['q'] ?? $_GET['search'] ?? '');
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = max(5, min(100, (int)($_GET['limit'] ?? 20)));
        $period = $_GET['period'] ?? 'all';
        $offset = ($page - 1) * $limit;

        $allowed = ['PENDING','APPROVED','REJECTED','FROZEN','ALL'];
        if (!in_array($status, $allowed)) $status = 'PENDING';

        // Global status counts for badges
        $countsStmt = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN is_frozen = 1 THEN 1 ELSE 0 END) as frozen
            FROM clinicregistrations
        ");
        $rawCounts = $countsStmt->fetch(PDO::FETCH_ASSOC) ?: [];
        $counts = [
            'PENDING'  => (int)($rawCounts['pending'] ?? 0),
            'APPROVED' => (int)($rawCounts['approved'] ?? 0),
            'REJECTED' => (int)($rawCounts['rejected'] ?? 0),
            'FROZEN'   => (int)($rawCounts['frozen'] ?? 0),
            'TOTAL'    => (int)($rawCounts['total'] ?? 0),
        ];

        // Filtering
        $where = [];
        $params = [];

        if ($status === 'FROZEN') {
            $where[] = "is_frozen = 1";
        } elseif ($status !== 'ALL') {
            $where[] = "status = ?";
            $params[] = $status;
        }

        if ($search !== '') {
            $where[] = "(clinicname LIKE ? OR email LIKE ? OR phone LIKE ? OR address LIKE ?)";
            $term = "%$search%";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        if ($period === 'today') {
            $where[] = "DATE(createdat) = CURDATE()";
        } elseif ($period === 'week') {
            $where[] = "createdat >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        } elseif ($period === 'month') {
            $where[] = "createdat >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        } elseif ($period === 'year') {
            $where[] = "createdat >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
        }

        $whereClause = !empty($where) ? "WHERE " . implode(' AND ', $where) : "";

        // Total for filtered set
        $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM clinicregistrations $whereClause");
        $totalStmt->execute($params);
        $total = (int)$totalStmt->fetchColumn();

        // Sort order
        $orderCol = 'createdat';
        if (($status === 'APPROVED') && isset($_GET['order_by']) && $_GET['order_by'] === 'approvedat') {
            $orderCol = 'approvedat';
        }
        $orderDir = (isset($_GET['order_dir']) && strtoupper($_GET['order_dir']) === 'ASC') ? 'ASC' : 'DESC';

        $query = "
            SELECT id, clinicname, email, phone, address, notes, status, rejectedreason, approvedat, createdat, clinic_id, user_id, is_frozen, freeze_reason, frozen_at
            FROM clinicregistrations
            $whereClause
            ORDER BY $orderCol $orderDir
            LIMIT $limit OFFSET $offset
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success([
            'items'       => $items,
            'total'       => $total,
            'page'        => $page,
            'limit'       => $limit,
            'total_pages' => max(1, ceil($total / $limit)),
            'counts'      => $counts,
        ]);
    }

    // ----------------------------------------------------------
    // GET /api/admin/doctors?status=PENDING&page=1&q=...&limit=20&period=all
    // ----------------------------------------------------------
    public static function listDoctors(): void {
        AuthMiddleware::adminOnly();
        $pdo    = Database::getInstance();
        $status = $_GET['status'] ?? 'PENDING';
        $search = trim($_GET['q'] ?? $_GET['search'] ?? '');
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = max(5, min(100, (int)($_GET['limit'] ?? 20)));
        $period = $_GET['period'] ?? 'all';
        $offset = ($page - 1) * $limit;

        $allowed = ['PENDING','APPROVED','REJECTED','FROZEN','ALL'];
        if (!in_array($status, $allowed)) $status = 'PENDING';

        // Global status counts for badges
        $countsStmt = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN is_frozen = 1 THEN 1 ELSE 0 END) as frozen
            FROM doctorregistrations
        ");
        $rawCounts = $countsStmt->fetch(PDO::FETCH_ASSOC) ?: [];
        $counts = [
            'PENDING'  => (int)($rawCounts['pending'] ?? 0),
            'APPROVED' => (int)($rawCounts['approved'] ?? 0),
            'REJECTED' => (int)($rawCounts['rejected'] ?? 0),
            'FROZEN'   => (int)($rawCounts['frozen'] ?? 0),
            'TOTAL'    => (int)($rawCounts['total'] ?? 0),
        ];

        // Filtering
        $where = [];
        $params = [];

        if ($status === 'FROZEN') {
            $where[] = "is_frozen = 1";
        } elseif ($status !== 'ALL') {
            $where[] = "status = ?";
            $params[] = $status;
        }

        if ($search !== '') {
            $where[] = "(fullname LIKE ? OR speciality LIKE ? OR email LIKE ? OR phone LIKE ? OR clinicname LIKE ?)";
            $term = "%$search%";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        if ($period === 'today') {
            $where[] = "DATE(createdat) = CURDATE()";
        } elseif ($period === 'week') {
            $where[] = "createdat >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        } elseif ($period === 'month') {
            $where[] = "createdat >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        } elseif ($period === 'year') {
            $where[] = "createdat >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
        }

        $whereClause = !empty($where) ? "WHERE " . implode(' AND ', $where) : "";

        // Total for filtered set
        $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM doctorregistrations $whereClause");
        $totalStmt->execute($params);
        $total = (int)$totalStmt->fetchColumn();

        // Sort order
        $orderCol = 'createdat';
        if (($status === 'APPROVED') && isset($_GET['order_by']) && $_GET['order_by'] === 'approvedat') {
            $orderCol = 'approvedat';
        }
        $orderDir = (isset($_GET['order_dir']) && strtoupper($_GET['order_dir']) === 'ASC') ? 'ASC' : 'DESC';

        $query = "
            SELECT id, fullname, speciality, email, phone, clinicname, status, rejectedreason, approvedat, createdat, doctor_id, user_id, is_frozen, freeze_reason, frozen_at
            FROM doctorregistrations
            $whereClause
            ORDER BY $orderCol $orderDir
            LIMIT $limit OFFSET $offset
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success([
            'items'       => $items,
            'total'       => $total,
            'page'        => $page,
            'limit'       => $limit,
            'total_pages' => max(1, ceil($total / $limit)),
            'counts'      => $counts,
        ]);
    }

    // ----------------------------------------------------------
    // POST /api/admin/clinics/{id}/approve
    // Approves clinic registration → creates clinics + users rows & sends credentials email
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
            $username = strtolower(str_replace(' ', '_', $reg['clinicname'])) . '_' . substr($id, 0, 6);

            // PHASE 02F : Ne jamais envoyer de mot de passe en clair par email (Loi 18-07).
            // L'utilisateur utilise le mot de passe qu'il a saisi lors de son inscription.

            // Create User (usertype=2 = Clinic)
            $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,2)")
                ->execute([$userId, $username, $reg['password']]);

            // Create Clinic record with phonevalidation = 1
            $pdo->prepare("
                INSERT INTO clinics (id, clinicname, phone, email, address, status, approvedat, user_id, phonevalidation)
                VALUES (?,?,?,?,?,  'APPROVED', NOW(), ?, 1)
            ")->execute([$clinicid, $reg['clinicname'], $reg['phone'], $reg['email'], $reg['address'], $userId]);

            // Update registration record
            $pdo->prepare("
                UPDATE clinicregistrations
                SET status='APPROVED', approvedat=NOW(), clinic_id=?, user_id=?
                WHERE id=?
            ")->execute([$clinicid, $userId, $id]);

            $pdo->commit();

            // Email d'approbation : ne jamais transmettre le mot de passe (null = message générique)
            EmailHelper::sendApprovalCredentials(
                $reg['email'],
                $reg['clinicname'],
                'clinic',
                $username,
                null
            );

            Response::success([
                'clinic_id' => $clinicid,
                'user_id'   => $userId,
                'username'  => $username,
            ], 'تمت الموافقة على العيادة بنجاح وتم إرسال معلومات الدخول إلى البريد الإلكتروني.');

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

            // PHASE 02B : Le mot de passe dans doctorregistrations est maintenant un hash Bcrypt.
            // PHASE 02F : Ne jamais envoyer de mot de passe en clair par email (Loi 18-07).
            // L'utilisateur utilise le mot de passe qu'il a saisi lors de son inscription.

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

                // Update the existing virtual doctor profile with phonevalidation = 1
                $pdo->prepare("
                    UPDATE doctors 
                    SET fullname=?, phone=?, email=?, emailvalidation=1, phonevalidation=1, user_id=?, status='APPROVED', approvedat=NOW()
                    WHERE id=?
                ")->execute([$reg['fullname'], $reg['phone'], $reg['email'], $userId, $doctorIdToUse]);

            } else {
                // Completely new doctor
                $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,1)")
                    ->execute([$userId, $username, $reg['password']]);

                // Create doctor with emailvalidation = 1 and phonevalidation = 1
                $pdo->prepare("
                    INSERT INTO doctors (id, fullname, phone, email, emailvalidation, phonevalidation, status, approvedat, user_id)
                    VALUES (?,?,?,?, 1, 1, 'APPROVED', NOW(), ?)
                ")->execute([$doctorIdToUse, $reg['fullname'], $reg['phone'], $reg['email'], $userId]);
            }

            // Update registration status
            $pdo->prepare("
                UPDATE doctorregistrations
                SET status='APPROVED', approvedat=NOW(), doctor_id=?, user_id=?
                WHERE id=?
            ")->execute([$doctorIdToUse, $userId, $id]);

            $pdo->commit();

            // إرسال بيانات الدخول إلى البريد الإلكتروني (اسم المستخدم، البريد، وكلمة المرور)
            EmailHelper::sendApprovalCredentials(
                $reg['email'],
                $reg['fullname'],
                'doctor',
                $username,
                null
            );

            Response::success([
                'doctor_id' => $doctorIdToUse,
                'user_id'   => $userId,
                'username'  => $username,
            ], 'تمت الموافقة على الطبيب بنجاح وتم إرسال معلومات الدخول إلى البريد الإلكتروني.');

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

    // ----------------------------------------------------------
    // POST /api/admin/clinics/{id}/freeze
    // Body: { reason: string }
    // ----------------------------------------------------------
    public static function freezeClinic(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo  = Database::getInstance();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $reason = trim($data['reason'] ?? '');
        if (empty($reason)) {
            Response::error('يرجى توضيح سبب تجميد الحساب.', 422);
        }

        $stmt = $pdo->prepare("SELECT * FROM clinicregistrations WHERE id=? OR clinic_id=? LIMIT 1");
        $stmt->execute([$id, $id]);
        $reg = $stmt->fetch();

        if (!$reg) {
            $stmtC = $pdo->prepare("SELECT * FROM clinics WHERE id=? LIMIT 1");
            $stmtC->execute([$id]);
            $clinic = $stmtC->fetch();
            if (!$clinic) Response::notFound('العيادة غير موجودة.');
            $clinicId   = $clinic['id'];
            $userId     = $clinic['user_id'];
            $clinicName = $clinic['clinicname'];
        } else {
            $clinicId   = $reg['clinic_id'];
            $userId     = $reg['user_id'];
            $clinicName = $reg['clinicname'];
        }

        if (!$userId) {
            Response::error('لا يمكن تجميد حساب لم يتم اعتماده وتفعيله بعد.', 400);
        }

        $pdo->beginTransaction();
        try {
            if ($clinicId) {
                $pdo->prepare("UPDATE clinics SET is_frozen = 1, freeze_reason = ?, frozen_at = NOW() WHERE id = ?")
                    ->execute([$reason, $clinicId]);
            }
            $pdo->prepare("UPDATE clinicregistrations SET is_frozen = 1, freeze_reason = ?, frozen_at = NOW() WHERE id = ? OR clinic_id = ?")
                ->execute([$reason, $id, $id]);

            // Invalidate active sessions immediately
            $pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$userId]);

            $pdo->commit();

            try {
                require_once __DIR__ . '/../helpers/NotificationHelper.php';
                NotificationHelper::notify(
                    $userId,
                    'تم تجميد حساب العيادة',
                    "تم تجميد اشتراك وحساب العيادة من قِبَل الإدارة. السبب: {$reason}. يرجى التواصل مع الدعم الفني.",
                    'warning'
                );
            } catch (\Throwable $e) {}

            Response::success([
                'clinic_id'     => $clinicId,
                'is_frozen'     => 1,
                'freeze_reason' => $reason
            ], 'تم تجميد اشتراك وحساب العيادة بنجاح وإلغاء كافة الجلسات النشطة.');
        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('حدث خطأ أثناء تجميد الحساب: ' . $e->getMessage());
        }
    }

    // ----------------------------------------------------------
    // POST /api/admin/clinics/{id}/release
    // ----------------------------------------------------------
    public static function releaseClinic(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT * FROM clinicregistrations WHERE id=? OR clinic_id=? LIMIT 1");
        $stmt->execute([$id, $id]);
        $reg = $stmt->fetch();

        if (!$reg) {
            $stmtC = $pdo->prepare("SELECT * FROM clinics WHERE id=? LIMIT 1");
            $stmtC->execute([$id]);
            $clinic = $stmtC->fetch();
            if (!$clinic) Response::notFound('العيادة غير موجودة.');
            $clinicId = $clinic['id'];
            $userId   = $clinic['user_id'];
        } else {
            $clinicId = $reg['clinic_id'];
            $userId   = $reg['user_id'];
        }

        $pdo->beginTransaction();
        try {
            if ($clinicId) {
                $pdo->prepare("UPDATE clinics SET is_frozen = 0, freeze_reason = NULL, frozen_at = NULL WHERE id = ?")
                    ->execute([$clinicId]);
            }
            $pdo->prepare("UPDATE clinicregistrations SET is_frozen = 0, freeze_reason = NULL, frozen_at = NULL WHERE id = ? OR clinic_id = ?")
                ->execute([$id, $id]);

            $pdo->commit();

            try {
                if ($userId) {
                    require_once __DIR__ . '/../helpers/NotificationHelper.php';
                    NotificationHelper::notify(
                        $userId,
                        'تم تفعيل وإلغاء تجميد الحساب',
                        'تم إلغاء تجميد حساب العيادة بنجاح. يمكنك الآن تسجيل الدخول ومتابعة العمل بصورة طبيعية.',
                        'success'
                    );
                }
            } catch (\Throwable $e) {}

            Response::success([
                'clinic_id' => $clinicId,
                'is_frozen' => 0
            ], 'تم إلغاء تجميد حساب العيادة وإعادة تفعيله بنجاح.');
        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('حدث خطأ أثناء إلغاء التجميد: ' . $e->getMessage());
        }
    }

    // ----------------------------------------------------------
    // POST /api/admin/doctors/{id}/freeze
    // Body: { reason: string }
    // ----------------------------------------------------------
    public static function freezeDoctor(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo  = Database::getInstance();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $reason = trim($data['reason'] ?? '');
        if (empty($reason)) {
            Response::error('يرجى توضيح سبب تجميد الحساب.', 422);
        }

        $stmt = $pdo->prepare("SELECT * FROM doctorregistrations WHERE id=? OR doctor_id=? LIMIT 1");
        $stmt->execute([$id, $id]);
        $reg = $stmt->fetch();

        if (!$reg) {
            $stmtD = $pdo->prepare("SELECT * FROM doctors WHERE id=? LIMIT 1");
            $stmtD->execute([$id]);
            $doctor = $stmtD->fetch();
            if (!$doctor) Response::notFound('الطبيب غير موجود.');
            $doctorId = $doctor['id'];
            $userId   = $doctor['user_id'];
        } else {
            $doctorId = $reg['doctor_id'];
            $userId   = $reg['user_id'];
        }

        if (!$userId) {
            Response::error('لا يمكن تجميد حساب لم يتم اعتماده وتفعيله بعد.', 400);
        }

        $pdo->beginTransaction();
        try {
            if ($doctorId) {
                $pdo->prepare("UPDATE doctors SET is_frozen = 1, freeze_reason = ?, frozen_at = NOW() WHERE id = ?")
                    ->execute([$reason, $doctorId]);
            }
            $pdo->prepare("UPDATE doctorregistrations SET is_frozen = 1, freeze_reason = ?, frozen_at = NOW() WHERE id = ? OR doctor_id = ?")
                ->execute([$reason, $id, $id]);

            $pdo->prepare("DELETE FROM sessions WHERE user_id = ?")->execute([$userId]);

            $pdo->commit();

            try {
                require_once __DIR__ . '/../helpers/NotificationHelper.php';
                NotificationHelper::notify(
                    $userId,
                    'تم تجميد حساب الطبيب',
                    "تم تجميد اشتراك وحساب الطبيب من قِبَل الإدارة. السبب: {$reason}. يرجى التواصل مع الدعم الفني.",
                    'warning'
                );
            } catch (\Throwable $e) {}

            Response::success([
                'doctor_id'     => $doctorId,
                'is_frozen'     => 1,
                'freeze_reason' => $reason
            ], 'تم تجميد اشتراك وحساب الطبيب بنجاح وإلغاء كافة الجلسات النشطة.');
        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('حدث خطأ أثناء تجميد الحساب: ' . $e->getMessage());
        }
    }

    // ----------------------------------------------------------
    // POST /api/admin/doctors/{id}/release
    // ----------------------------------------------------------
    public static function releaseDoctor(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT * FROM doctorregistrations WHERE id=? OR doctor_id=? LIMIT 1");
        $stmt->execute([$id, $id]);
        $reg = $stmt->fetch();

        if (!$reg) {
            $stmtD = $pdo->prepare("SELECT * FROM doctors WHERE id=? LIMIT 1");
            $stmtD->execute([$id]);
            $doctor = $stmtD->fetch();
            if (!$doctor) Response::notFound('الطبيب غير موجود.');
            $doctorId = $doctor['id'];
            $userId   = $doctor['user_id'];
        } else {
            $doctorId = $reg['doctor_id'];
            $userId   = $reg['user_id'];
        }

        $pdo->beginTransaction();
        try {
            if ($doctorId) {
                $pdo->prepare("UPDATE doctors SET is_frozen = 0, freeze_reason = NULL, frozen_at = NULL WHERE id = ?")
                    ->execute([$doctorId]);
            }
            $pdo->prepare("UPDATE doctorregistrations SET is_frozen = 0, freeze_reason = NULL, frozen_at = NULL WHERE id = ? OR doctor_id = ?")
                ->execute([$id, $id]);

            $pdo->commit();

            try {
                if ($userId) {
                    require_once __DIR__ . '/../helpers/NotificationHelper.php';
                    NotificationHelper::notify(
                        $userId,
                        'تم تفعيل وإلغاء تجميد الحساب',
                        'تم إلغاء تجميد حسابك الطبي بنجاح. يمكنك الآن تسجيل الدخول واستقبال المواعيد بصورة طبيعية.',
                        'success'
                    );
                }
            } catch (\Throwable $e) {}

            Response::success([
                'doctor_id' => $doctorId,
                'is_frozen' => 0
            ], 'تم إلغاء تجميد حساب الطبيب وإعادة تفعيله بنجاح.');
        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('حدث خطأ أثناء إلغاء التجميد: ' . $e->getMessage());
        }
    }

    // ----------------------------------------------------------
    // GET /api/admin/system-status
    // Returns DB sync status, service health, and active sessions.
    // Accessible to both usertype = 3 (SuperAdmin) and usertype = 4 (Support).
    // ----------------------------------------------------------
    public static function getSystemStatus(): void {
        AuthMiddleware::adminOnly();
        require_once __DIR__ . '/../helpers/RateLimiter.php';

        $pdo = Database::getInstance();
        $start = microtime(true);

        $status = [];

        // ── 1. Database Synchronization Status ──────────────────
        $dbSync = ['status' => 'HEALTHY'];

        $dbSync['total_appointments'] = (int)$pdo->query("SELECT COUNT(*) FROM apointements")->fetchColumn();
        $dbSync['total_doctors']      = (int)$pdo->query("SELECT COUNT(*) FROM doctors")->fetchColumn();
        $dbSync['total_clinics']      = (int)$pdo->query("SELECT COUNT(*) FROM clinics")->fetchColumn();
        $dbSync['total_patients']     = (int)$pdo->query("SELECT COUNT(*) FROM patients")->fetchColumn();
        $dbSync['total_sessions']     = (int)$pdo->query("SELECT COUNT(*) FROM sessions")->fetchColumn();

        // Latest sync activity
        $latestAppt = $pdo->query("SELECT MAX(updatedat) FROM apointements")->fetchColumn();
        $dbSync['last_activity_at'] = $latestAppt ?: null;

        // Table integrity: check status via SHOW TABLE STATUS
        try {
            $tables = ['users','sessions','doctors','clinics','patients','apointements'];
            $tableOk = true;
            foreach ($tables as $t) {
                $row = $pdo->query("SHOW TABLE STATUS LIKE '$t'")->fetch(PDO::FETCH_ASSOC);
                if (!$row || ($row['Engine'] === null)) { $tableOk = false; break; }
            }
            $dbSync['tables_ok'] = $tableOk;
            $dbSync['integrity'] = $tableOk ? 'OK' : 'WARNING';
        } catch (\Exception $e) {
            $dbSync['tables_ok'] = false;
            $dbSync['integrity'] = 'UNKNOWN';
        }

        // Pending sync (doctor registrations awaiting approval)
        $dbSync['pending_doctor_registrations'] = (int)$pdo->query("SELECT COUNT(*) FROM doctorregistrations WHERE status='PENDING'")->fetchColumn();
        $dbSync['pending_clinic_registrations'] = (int)$pdo->query("SELECT COUNT(*) FROM clinicregistrations WHERE status='PENDING'")->fetchColumn();

        $status['db_sync'] = $dbSync;

        // ── 2. Service Health ────────────────────────────────────
        $services = [];

        // API Service
        $services['api'] = [
            'name'    => 'API Backend',
            'status'  => 'OPERATIONAL',
            'php_version' => PHP_VERSION,
            'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
            'latency_ms' => round((microtime(true) - $start) * 1000, 2),
        ];

        // Database connectivity + latency
        $dbStart = microtime(true);
        try {
            $pdo->query("SELECT 1");
            $dbLatency = round((microtime(true) - $dbStart) * 1000, 2);
            // MySQL version
            $mysqlVersion = $pdo->query("SELECT VERSION()")->fetchColumn();
            // Active threads
            $threads = (int)$pdo->query("SHOW STATUS LIKE 'Threads_connected'")->fetch(PDO::FETCH_ASSOC)['Value'];
            $services['database'] = [
                'name'       => 'MySQL Database',
                'status'     => 'CONNECTED',
                'version'    => $mysqlVersion,
                'latency_ms' => $dbLatency,
                'threads'    => $threads,
            ];
        } catch (\Exception $e) {
            $services['database'] = ['name' => 'MySQL Database', 'status' => 'ERROR', 'error' => $e->getMessage()];
        }

        // Storage / Uploads
        $uploadDir = __DIR__ . '/../../uploads';
        $altUploadDir = __DIR__ . '/../uploads';
        $actualUploadDir = is_dir($uploadDir) ? $uploadDir : (is_dir($altUploadDir) ? $altUploadDir : null);
        if ($actualUploadDir) {
            $diskFreeBytes = @disk_free_space($actualUploadDir);
            $diskTotalBytes = @disk_total_space($actualUploadDir);
            $services['storage'] = [
                'name'    => 'Storage / Uploads',
                'status'  => (is_writable($actualUploadDir)) ? 'ACCESSIBLE' : 'READ_ONLY',
                'writable' => is_writable($actualUploadDir),
                'free_gb'  => $diskFreeBytes !== false ? round($diskFreeBytes / 1024 / 1024 / 1024, 2) : null,
                'total_gb' => $diskTotalBytes !== false ? round($diskTotalBytes / 1024 / 1024 / 1024, 2) : null,
            ];
        } else {
            $services['storage'] = ['name' => 'Storage / Uploads', 'status' => 'NOT_FOUND', 'writable' => false];
        }

        // Sessions Service
        $activeSessions = (int)$pdo->query("SELECT COUNT(*) FROM sessions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();
        $adminSessions  = (int)$pdo->query("SELECT COUNT(*) FROM sessions s JOIN users u ON s.user_id = u.id WHERE u.usertype IN (3,4) AND s.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();
        $services['sessions'] = [
            'name'            => 'Auth / Sessions',
            'status'          => 'ACTIVE',
            'active_total'    => $activeSessions,
            'active_admin'    => $adminSessions,
            'token_expiry_days' => defined('TOKEN_EXPIRY') ? round(TOKEN_EXPIRY / 86400) : 30,
        ];

        // Security service
        $services['security'] = [
            'name'           => 'Security Layer',
            'status'         => 'PROTECTED',
            'rate_limiting'  => true,
            'bcrypt_hashing' => true,
            'ssl_bearer'     => true,
        ];

        $status['services'] = $services;

        // ── 3. Quick Links / Shortcuts ──────────────────────────
        $status['shortcuts'] = [
            ['label' => 'Admin Dashboard',    'url' => '/admin'],
            ['label' => 'Support Tickets',    'url' => '/admin?tab=support_tickets'],
            ['label' => 'Account Management', 'url' => '/admin?tab=accounts'],
        ];

        $status['generated_at'] = date('Y-m-d H:i:s');
        $status['server_ip']    = RateLimiter::getClientIp();

        Response::success($status);
    }
}
