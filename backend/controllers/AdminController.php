<?php
// ============================================================
// controllers/AdminController.php  —  UserType = 3
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

        // Clinics
        $r = $pdo->query("SELECT COUNT(*) FROM Clinics")->fetchColumn();
        $stats['total_clinics'] = (int)$r;

        // Doctors
        $r = $pdo->query("SELECT COUNT(*) FROM Doctors")->fetchColumn();
        $stats['total_doctors'] = (int)$r;

        // Patients
        $r = $pdo->query("SELECT COUNT(*) FROM Patients")->fetchColumn();
        $stats['total_patients'] = (int)$r;

        // Appointments
        $r = $pdo->query("SELECT COUNT(*) FROM Apointements")->fetchColumn();
        $stats['total_appointments'] = (int)$r;

        // Today's appointments
        $r = $pdo->query("SELECT COUNT(*) FROM Apointements WHERE DATE(AppointementDate) = CURDATE()")->fetchColumn();
        $stats['today_appointments'] = (int)$r;

        // This month's appointments
        $r = $pdo->query("SELECT COUNT(*) FROM Apointements WHERE YEAR(AppointementDate)=YEAR(NOW()) AND MONTH(AppointementDate)=MONTH(NOW())")->fetchColumn();
        $stats['month_appointments'] = (int)$r;

        // Pending clinic registrations
        $r = $pdo->query("SELECT COUNT(*) FROM ClinicRegistrations WHERE Status='PENDING'")->fetchColumn();
        $stats['pending_clinics'] = (int)$r;

        // Pending doctor registrations
        $r = $pdo->query("SELECT COUNT(*) FROM DoctorRegistrations WHERE Status='PENDING'")->fetchColumn();
        $stats['pending_doctors'] = (int)$r;

        // Monthly clinic growth (last 6 months)
        $stmt = $pdo->query("
            SELECT DATE_FORMAT(CreatedAt,'%Y-%m') as month, COUNT(*) as count
            FROM ClinicRegistrations
            WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month ORDER BY month ASC
        ");
        $stats['clinic_growth'] = $stmt->fetchAll();

        // Monthly appointment trend (last 6 months)
        $stmt = $pdo->query("
            SELECT DATE_FORMAT(AppointementDate,'%Y-%m') as month, COUNT(*) as count
            FROM Apointements
            WHERE AppointementDate >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
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

        $total = $pdo->prepare("SELECT COUNT(*) FROM ClinicRegistrations WHERE Status=?");
        $total->execute([$status]);
        $total = (int)$total->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT ID, ClinicName, Email, Phone, Address, Notes, Status, RejectedReason, ApprovedAt, CreatedAt
            FROM ClinicRegistrations
            WHERE Status=?
            ORDER BY CreatedAt DESC
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

        $total = $pdo->prepare("SELECT COUNT(*) FROM DoctorRegistrations WHERE Status=?");
        $total->execute([$status]);
        $total = (int)$total->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT ID, FullName, Speciality, Email, Phone, ClinicName, Status, RejectedReason, ApprovedAt, CreatedAt
            FROM DoctorRegistrations
            WHERE Status=?
            ORDER BY CreatedAt DESC
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
    // Approves clinic registration → creates Clinics + Users rows
    // ----------------------------------------------------------
    public static function approveClinic(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT * FROM ClinicRegistrations WHERE ID=? LIMIT 1");
        $stmt->execute([$id]);
        $reg = $stmt->fetch();

        if (!$reg) Response::notFound('Demande introuvable');
        if ($reg['Status'] !== 'PENDING') Response::error('Cette demande a déjà été traitée', 409);

        $pdo->beginTransaction();
        try {
            $userId   = UUIDHelper::generate();
            $clinicId = UUIDHelper::generate();

            // Create User (UserType=2 = Clinic)
            $pdo->prepare("INSERT INTO Users (ID, Username, Password, UserType) VALUES (?,?,?,2)")
                ->execute([$userId, strtolower(str_replace(' ', '_', $reg['ClinicName'])) . '_' . substr($id, 0, 6), $reg['Password']]);

            // Create Clinic record
            $pdo->prepare("
                INSERT INTO Clinics (ID, ClinicName, Phone, Email, Address, Status, ApprovedAt, Global_id)
                VALUES (?,?,?,?,?,  'APPROVED', NOW(), ?)
            ")->execute([$clinicId, $reg['ClinicName'], $reg['Phone'], $reg['Email'], $reg['Address'], UUIDHelper::generate()]);

            // Update registration record
            $pdo->prepare("
                UPDATE ClinicRegistrations
                SET Status='APPROVED', ApprovedAt=NOW(), Clinic_ID=?, User_ID=?
                WHERE ID=?
            ")->execute([$clinicId, $userId, $id]);

            $pdo->commit();

            Response::success([
                'clinic_id' => $clinicId,
                'user_id'   => $userId,
            ], 'Clinique approuvée avec succès');

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

        $stmt = $pdo->prepare("SELECT Status FROM ClinicRegistrations WHERE ID=? LIMIT 1");
        $stmt->execute([$id]);
        $reg = $stmt->fetch();

        if (!$reg) Response::notFound('Demande introuvable');
        if ($reg['Status'] !== 'PENDING') Response::error('Cette demande a déjà été traitée', 409);

        $pdo->prepare("
            UPDATE ClinicRegistrations
            SET Status='REJECTED', RejectedReason=?
            WHERE ID=?
        ")->execute([$data['reason'] ?? null, $id]);

        Response::success(null, 'Clinique rejetée');
    }

    // ----------------------------------------------------------
    // POST /api/admin/doctors/{id}/approve
    // ----------------------------------------------------------
    public static function approveDoctor(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("SELECT * FROM DoctorRegistrations WHERE ID=? LIMIT 1");
        $stmt->execute([$id]);
        $reg = $stmt->fetch();

        if (!$reg) Response::notFound('Demande introuvable');
        if ($reg['Status'] !== 'PENDING') Response::error('Cette demande a déjà été traitée', 409);

        $pdo->beginTransaction();
        try {
            $userId   = UUIDHelper::generate();
            $doctorId = UUIDHelper::generate();

            // Create User (UserType=1 = Doctor)
            $username = strtolower(str_replace(' ', '_', $reg['FullName'])) . '_' . substr($id, 0, 6);
            $pdo->prepare("INSERT INTO Users (ID, Username, Password, UserType) VALUES (?,?,?,1)")
                ->execute([$userId, $username, $reg['Password']]);

            // Create Doctor record
            $pdo->prepare("
                INSERT INTO Doctors (ID, FullName, Phone, Email, Status, ApprovedAt, User_id, Global_id)
                VALUES (?,?,?,?, 'APPROVED', NOW(), ?, ?)
            ")->execute([$doctorId, $reg['FullName'], $reg['Phone'], $reg['Email'], $userId, UUIDHelper::generate()]);

            // Update registration
            $pdo->prepare("
                UPDATE DoctorRegistrations
                SET Status='APPROVED', ApprovedAt=NOW(), Doctor_ID=?, User_ID=?
                WHERE ID=?
            ")->execute([$doctorId, $userId, $id]);

            $pdo->commit();

            Response::success([
                'doctor_id' => $doctorId,
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

        $stmt = $pdo->prepare("SELECT Status FROM DoctorRegistrations WHERE ID=? LIMIT 1");
        $stmt->execute([$id]);
        $reg = $stmt->fetch();

        if (!$reg) Response::notFound('Demande introuvable');
        if ($reg['Status'] !== 'PENDING') Response::error('Cette demande a déjà été traitée', 409);

        $pdo->prepare("
            UPDATE DoctorRegistrations
            SET Status='REJECTED', RejectedReason=?
            WHERE ID=?
        ")->execute([$data['reason'] ?? null, $id]);

        Response::success(null, 'Médecin rejeté');
    }
}
