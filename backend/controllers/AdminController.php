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
        $r = $pdo->query("SELECT COUNT(*) FROM apointements WHERE DATE(appointementdate) = CURDATE()")->fetchColumn();
        $stats['today_appointments'] = (int)$r;

        // This month's appointments
        $r = $pdo->query("SELECT COUNT(*) FROM apointements WHERE YEAR(appointementdate)=YEAR(NOW()) AND MONTH(appointementdate)=MONTH(NOW())")->fetchColumn();
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
            SELECT DATE_FORMAT(appointementdate,'%Y-%m') as month, COUNT(*) as count
            FROM apointements
            WHERE appointementdate >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month ORDER BY month ASC
        ");
        $stats['appointment_trend'] = $stmt->fetchAll();

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

        if (!$reg) Response::notFound('Demande introuvable');
        if ($reg['status'] !== 'PENDING') Response::error('Cette demande a déjà été traitée', 409);

        $pdo->beginTransaction();
        try {
            $userId   = UUIDHelper::generate();
            $clinicid = UUIDHelper::generate();

            // Create User (usertype=2 = Clinic)
            $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,2)")
                ->execute([$userId, strtolower(str_replace(' ', '_', $reg['clinicname'])) . '_' . substr($id, 0, 6), $reg['password']]);

            // Create Clinic record
            $pdo->prepare("
                INSERT INTO clinics (id, clinicname, phone, email, address, status, approvedat)
                VALUES (?,?,?,?,?,  'APPROVED', NOW())
            ")->execute([$clinicid, $reg['clinicname'], $reg['phone'], $reg['email'], $reg['address']]);

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
            ], 'clinique approuvée avec succès');

        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('Erreur lors de l\'approbation: ' . $e->getMessage());
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

        if (!$reg) Response::notFound('Demande introuvable');
        if ($reg['status'] !== 'PENDING') Response::error('Cette demande a déjà été traitée', 409);

        $pdo->prepare("
            UPDATE clinicregistrations
            SET status='REJECTED', rejectedreason=?
            WHERE id=?
        ")->execute([$data['reason'] ?? null, $id]);

        Response::success(null, 'clinique rejetée');
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

        if (!$reg) Response::notFound('Demande introuvable');
        if ($reg['status'] !== 'PENDING') Response::error('Cette demande a déjà été traitée', 409);

        $pdo->beginTransaction();
        try {
            $userId   = UUIDHelper::generate();
            $doctor_id = UUIDHelper::generate();

            // Create User (usertype=1 = Doctor)
            $username = strtolower(str_replace(' ', '_', $reg['fullname'])) . '_' . substr($id, 0, 6);
            $pdo->prepare("INSERT INTO users (id, username, password, usertype) VALUES (?,?,?,1)")
                ->execute([$userId, $username, $reg['password']]);

            // Create Doctor record
            $pdo->prepare("
                INSERT INTO doctors (id, fullname, phone, email, status, approvedat, user_id)
                VALUES (?,?,?,?, 'APPROVED', NOW(), ?)
            ")->execute([$doctor_id, $reg['fullname'], $reg['phone'], $reg['email'], $userId]);

            // Update registration
            $pdo->prepare("
                UPDATE doctorregistrations
                SET status='APPROVED', approvedat=NOW(), doctor_id=?, user_id=?
                WHERE id=?
            ")->execute([$doctor_id, $userId, $id]);

            $pdo->commit();

            Response::success([
                'doctor_id' => $doctor_id,
                'user_id'   => $userId,
                'username'  => $username,
            ], 'Médecin approuvé avec succès');

        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('Erreur lors de l\'approbation: ' . $e->getMessage());
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

        if (!$reg) Response::notFound('Demande introuvable');
        if ($reg['status'] !== 'PENDING') Response::error('Cette demande a déjà été traitée', 409);

        $pdo->prepare("
            UPDATE doctorregistrations
            SET status='REJECTED', rejectedreason=?
            WHERE id=?
        ")->execute([$data['reason'] ?? null, $id]);

        Response::success(null, 'Médecin rejeté');
    }
}
