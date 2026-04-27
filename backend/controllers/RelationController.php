<?php
// ============================================================
// controllers/RelationController.php
// Manages Join/Recruit requests between doctors and clinics
// using clinicsdoctors table
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class RelationController {

    public static function sendRequest(): void {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $targetid = $data['target_id'] ?? '';

        if (!$targetid) Response::error('Target id requis', 422);

        $pdo = Database::getInstance();
        $senderType = '';
        $clinicid = '';
        $doctor_id = '';

        if ($user['usertype'] == 1) { // DOCTOR
            $senderType = 'DOCTOR';
            $doctor_id = $user['doctor_id'] ?? self::getDoctorId($user['user_id']);
            $clinicid = $targetid;
        } else if ($user['usertype'] == 2) { // CLINIC
            $senderType = 'CLINIC';
            $clinicid = $user['clinic_id'] ?? self::getClinicId($user['user_id']);
            $doctor_id = $targetid;
        } else {
            Response::error('Seuls les médecins et les cliniques peuvent envoyer des demandes', 403);
        }

        if (!$doctor_id) {
            Response::error("معرف الطبيب مفقود (Doctor id is missing or invalid). targetid: $targetid", 400);
        }
        if (!$clinicid) {
            Response::error("معرف العيادة مفقود (Clinic id is missing or invalid). targetid: $targetid", 400);
        }

        // Check if relation already exists
        $stmt = $pdo->prepare("SELECT id, status FROM clinicsdoctors WHERE clinic_id=? AND doctor_id=?");
        $stmt->execute([$clinicid, $doctor_id]);
        $existing = $stmt->fetch();

        if ($existing) {
            $status = strtolower($existing['status']);
            if ($status === 'accepted' || $status === 'approved') {
                Response::error('Déjà lié', 409);
            } else if ($status === 'pending') {
                Response::error('Une demande est déjà en cours', 409);
            } else {
                // If rejected, we might want to update it to pending again
                $pdo->prepare("UPDATE clinicsdoctors SET status='pending', requestedby=? WHERE clinic_id=? AND doctor_id=?")->execute([$senderType, $clinicid, $doctor_id]);
                Response::success(null, 'Demande envoyée avec succès');
                return;
            }
        }

        // We need a specialtie_id for clinicsdoctors. Get the primary specialty of the doctor
        $stmtD = $pdo->prepare("SELECT specialtie_id FROM doctors WHERE id=? LIMIT 1");
        $stmtD->execute([$doctor_id]);
        $sid = $stmtD->fetchColumn();

        if (empty($sid) || $sid === 'unknown') {
            // Fallback to a valid specialty id to satisfy foreign key constraint
            $sid = $pdo->query("SELECT id FROM specialties LIMIT 1")->fetchColumn();
        }

        $id = UUIDHelper::generate();
        file_put_contents(__DIR__.'/../request_log.txt', date('Y-m-d H:i:s') . " - sendRequest: targetid=$targetid, clinicid=$clinicid, doctor_id=$doctor_id, sid=$sid, senderType=$senderType\n", FILE_APPEND);
        try {
            $pdo->prepare("
                INSERT INTO clinicsdoctors (id, clinic_id, doctor_id, specialtie_id, status, requestedby)
                VALUES (?, ?, ?, ?, 'pending', ?)
            ")->execute([$id, $clinicid, $doctor_id, $sid, $senderType]);

            Response::success(['request_id' => $id], 'Demande envoyée avec succès');
        } catch (\PDOException $e) {
            $err = "SQL Error: " . $e->getMessage() . " | clinicid: $clinicid | doctor_id: $doctor_id | SID: $sid";
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

        if ($user['usertype'] == 1) { // DOCTOR
            $myId = $user['doctor_id'] ?? self::getDoctorId($user['user_id']);
            $filterCol = 'doctor_id';
            $joinTable = 'clinics';
            $joinCol = 'clinic_id';
            $nameCol = 'clinicname as targetname';
        } else if ($user['usertype'] == 2) { // CLINIC
            $myId = $user['clinic_id'] ?? self::getClinicId($user['user_id']);
            $filterCol = 'clinic_id';
            $joinTable = 'doctors';
            $joinCol = 'doctor_id';
            $nameCol = 'fullname as targetname';
        } else {
            Response::error('Non autorisé', 403);
        }

        // We want to fetch all clinicsdoctors records for this user where it's a request state
        // (status = pending, accepted, rejected) and it acts as a "Request".
        // Actually, let's fetch pending, and maybe recently accepted/rejected. 
        // For simplicity, we can fetch all or just pending ones, but UI expects history.
        
        $stmt = $pdo->prepare("
            SELECT r.id, r.clinic_id, r.doctor_id, r.status, r.requestedby as SenderType, t.$nameCol, '2025-01-01 00:00:00' as createdat
            FROM clinicsdoctors r
            JOIN $joinTable t ON t.id = r.$joinCol
            WHERE r.$filterCol = ? AND r.status IN ('pending', 'accepted', 'rejected', 'APPROVED')
        ");
        $stmt->execute([$myId]);
        
        $results = $stmt->fetchAll();
        foreach ($results as &$r) {
            // Normalize status to upper for frontend
            if (strtolower($r['status']) === 'accepted' || strtoupper($r['status']) === 'APPROVED') {
                $r['status'] = 'ACCEPTED';
            } else if (strtolower($r['status']) === 'rejected') {
                $r['status'] = 'REJECTED';
            } else {
                $r['status'] = 'PENDING';
            }
        }
        
        Response::success($results);
    }

    public static function checkRelation(string $targetid): void {
        $user = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();
        
        $myId = '';
        $filterCol = '';
        $targetCol = '';

        if ($user['usertype'] == 1) { // Doctor checking relation with Clinic
            $myId = $user['doctor_id'] ?? self::getDoctorId($user['user_id']);
            $filterCol = 'doctor_id';
            $targetCol = 'clinic_id';
        } else if ($user['usertype'] == 2) { // Clinic checking relation with Doctor
            $myId = $user['clinic_id'] ?? self::getClinicId($user['user_id']);
            $filterCol = 'clinic_id';
            $targetCol = 'doctor_id';
        } else {
            Response::success(['status' => null]);
            return;
        }

        $stmt = $pdo->prepare("SELECT status FROM clinicsdoctors WHERE $filterCol = ? AND $targetCol = ? LIMIT 1");
        $stmt->execute([$myId, $targetid]);
        $status = $stmt->fetchColumn();
        
        Response::success(['status' => $status ? strtoupper($status) : null]);
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
        $stmt = $pdo->prepare("SELECT * FROM clinicsdoctors WHERE id=? LIMIT 1");
        $stmt->execute([$requestId]);
        $req = $stmt->fetch();

        if (!$req || strtolower($req['status']) !== 'pending') {
            Response::notFound('Demande introuvable ou déjà traitée');
        }

        if ($user['usertype'] == 1) { // Doctor
            $myDoctorId = $user['doctor_id'] ?? self::getDoctorId($user['user_id']);
            if ($req['doctor_id'] !== $myDoctorId || strtoupper($req['requestedby']) !== 'CLINIC') {
                Response::error('Vous ne pouvez pas répondre à cette demande', 403);
            }
        } else if ($user['usertype'] == 2) { // Clinic
            $myClinicId = $user['clinic_id'] ?? self::getClinicId($user['user_id']);
            if ($req['clinic_id'] !== $myClinicId || strtoupper($req['requestedby']) !== 'DOCTOR') {
                Response::error('Vous ne pouvez pas répondre à cette demande', 403);
            }
        }

        $pdo->prepare("UPDATE clinicsdoctors SET status=? WHERE id=?")->execute([$newStatus, $requestId]);
        Response::success(null, "Demande $newStatus");
    }

    private static function getDoctorId(string $userId): string {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id=? LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: '';
    }

    private static function getClinicId(string $userId): string {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM clinics WHERE user_id=? LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: '';
    }
}
