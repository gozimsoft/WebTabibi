<?php
// ============================================================
// controllers/RelationController.php
// Manages Join/Recruit requests between Doctors and Clinics
// using ClinicsDoctors table
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class RelationController {

    public static function sendRequest(): void {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $targetId = $data['target_id'] ?? '';

        if (!$targetId) Response::error('Target ID requis', 422);

        $pdo = Database::getInstance();
        $senderType = '';
        $clinicId = '';
        $doctorId = '';

        if ($user['UserType'] == 1) { // DOCTOR
            $senderType = 'DOCTOR';
            $doctorId = $user['Doctor_id'] ?? self::getDoctorId($user['user_id']);
            $clinicId = $targetId;
        } else if ($user['UserType'] == 2) { // CLINIC
            $senderType = 'CLINIC';
            $clinicId = $user['Clinic_id'] ?? self::getClinicId($user['user_id']);
            $doctorId = $targetId;
        } else {
            Response::error('Seuls les médecins et les cliniques peuvent envoyer des demandes', 403);
        }

        if (!$doctorId) {
            Response::error("معرف الطبيب مفقود (Doctor ID is missing or invalid). TargetID: $targetId", 400);
        }
        if (!$clinicId) {
            Response::error("معرف العيادة مفقود (Clinic ID is missing or invalid). TargetID: $targetId", 400);
        }

        // Check if relation already exists
        $stmt = $pdo->prepare("SELECT ID, Status FROM ClinicsDoctors WHERE Clinic_ID=? AND Doctor_ID=?");
        $stmt->execute([$clinicId, $doctorId]);
        $existing = $stmt->fetch();

        if ($existing) {
            $status = strtolower($existing['Status']);
            if ($status === 'accepted' || $status === 'approved') {
                Response::error('Déjà lié', 409);
            } else if ($status === 'pending') {
                Response::error('Une demande est déjà en cours', 409);
            } else {
                // If rejected, we might want to update it to pending again
                $pdo->prepare("UPDATE ClinicsDoctors SET Status='pending', RequestedBy=? WHERE Clinic_ID=? AND Doctor_ID=?")->execute([$senderType, $clinicId, $doctorId]);
                Response::success(null, 'Demande envoyée avec succès');
                return;
            }
        }

        // We need a specialtie_id for ClinicsDoctors. Get the primary specialty of the doctor
        $stmtD = $pdo->prepare("SELECT Specialtie_id FROM Doctors WHERE ID=? LIMIT 1");
        $stmtD->execute([$doctorId]);
        $sid = $stmtD->fetchColumn();

        if (empty($sid) || $sid === 'unknown') {
            // Fallback to a valid specialty ID to satisfy foreign key constraint
            $sid = $pdo->query("SELECT ID FROM Specialties LIMIT 1")->fetchColumn();
        }

        $id = UUIDHelper::generate();
        file_put_contents(__DIR__.'/../request_log.txt', date('Y-m-d H:i:s') . " - sendRequest: targetId=$targetId, clinicId=$clinicId, doctorId=$doctorId, sid=$sid, senderType=$senderType\n", FILE_APPEND);
        try {
            $pdo->prepare("
                INSERT INTO ClinicsDoctors (ID, Clinic_ID, Doctor_ID, specialtie_id, Status, RequestedBy)
                VALUES (?, ?, ?, ?, 'pending', ?)
            ")->execute([$id, $clinicId, $doctorId, $sid, $senderType]);

            Response::success(['request_id' => $id], 'Demande envoyée avec succès');
        } catch (\PDOException $e) {
            $err = "SQL Error: " . $e->getMessage() . " | ClinicID: $clinicId | DoctorID: $doctorId | SID: $sid";
            file_put_contents(__DIR__.'/../request_log.txt', date('Y-m-d H:i:s') . " - ERROR: $err\n", FILE_APPEND);
            Response::error($err, 500);
        }
    }

    public static function getRequests(): void {
        $user = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();
        
        $myId = '';
        $filterCol = '';
        $joinTable = '';
        $joinCol = '';
        $nameCol = '';

        if ($user['UserType'] == 1) { // DOCTOR
            $myId = $user['Doctor_id'] ?? self::getDoctorId($user['user_id']);
            $filterCol = 'Doctor_ID';
            $joinTable = 'Clinics';
            $joinCol = 'Clinic_ID';
            $nameCol = 'ClinicName as TargetName';
        } else if ($user['UserType'] == 2) { // CLINIC
            $myId = $user['Clinic_id'] ?? self::getClinicId($user['user_id']);
            $filterCol = 'Clinic_ID';
            $joinTable = 'Doctors';
            $joinCol = 'Doctor_ID';
            $nameCol = 'FullName as TargetName';
        } else {
            Response::error('Non autorisé', 403);
        }

        // We want to fetch all ClinicsDoctors records for this user where it's a request state
        // (Status = pending, accepted, rejected) and it acts as a "Request".
        // Actually, let's fetch pending, and maybe recently accepted/rejected. 
        // For simplicity, we can fetch all or just pending ones, but UI expects history.
        
        $stmt = $pdo->prepare("
            SELECT r.ID, r.Clinic_ID, r.Doctor_ID, r.Status, r.RequestedBy as SenderType, t.$nameCol, '2025-01-01 00:00:00' as CreatedAt
            FROM ClinicsDoctors r
            JOIN $joinTable t ON t.ID = r.$joinCol
            WHERE r.$filterCol = ? AND r.Status IN ('pending', 'accepted', 'rejected', 'APPROVED')
        ");
        $stmt->execute([$myId]);
        
        $results = $stmt->fetchAll();
        foreach ($results as &$r) {
            // Normalize status to upper for frontend
            if (strtolower($r['Status']) === 'accepted' || strtoupper($r['Status']) === 'APPROVED') {
                $r['Status'] = 'ACCEPTED';
            } else if (strtolower($r['Status']) === 'rejected') {
                $r['Status'] = 'REJECTED';
            } else {
                $r['Status'] = 'PENDING';
            }
        }
        
        Response::success($results);
    }

    public static function respondToRequest(string $requestId): void {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = strtolower($data['action'] ?? '');

        if (!in_array($action, ['accept', 'reject', 'accepted', 'rejected'])) {
            Response::error('Action invalide', 422);
        }
        
        $newStatus = ($action === 'accept' || $action === 'accepted') ? 'accepted' : 'rejected';

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM ClinicsDoctors WHERE ID=? LIMIT 1");
        $stmt->execute([$requestId]);
        $req = $stmt->fetch();

        if (!$req || strtolower($req['Status']) !== 'pending') {
            Response::notFound('Demande introuvable ou déjà traitée');
        }

        if ($user['UserType'] == 1) { // Doctor
            $myDoctorId = $user['Doctor_id'] ?? self::getDoctorId($user['user_id']);
            if ($req['Doctor_ID'] !== $myDoctorId || strtoupper($req['RequestedBy']) !== 'CLINIC') {
                Response::error('Vous ne pouvez pas répondre à cette demande', 403);
            }
        } else if ($user['UserType'] == 2) { // Clinic
            $myClinicId = $user['Clinic_id'] ?? self::getClinicId($user['user_id']);
            if ($req['Clinic_ID'] !== $myClinicId || strtoupper($req['RequestedBy']) !== 'DOCTOR') {
                Response::error('Vous ne pouvez pas répondre à cette demande', 403);
            }
        }

        $pdo->prepare("UPDATE ClinicsDoctors SET Status=? WHERE ID=?")->execute([$newStatus, $requestId]);
        Response::success(null, "Demande $newStatus");
    }

    private static function getDoctorId(string $userId): string {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT ID FROM Doctors WHERE User_id=? LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: '';
    }

    private static function getClinicId(string $userId): string {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT Clinic_ID FROM ClinicRegistrations WHERE User_ID=? LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: '';
    }
}
