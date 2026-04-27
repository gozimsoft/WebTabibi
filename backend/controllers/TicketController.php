<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class TicketController {

    public static function create(): void {
        $user = AuthMiddleware::authenticate();
        if ($user['usertype'] != 0) { // Only patients can start tickets
            Response::error('Seuls les patients peuvent créer des tickets', 403);
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $subject = trim($data['subject'] ?? '');
        $message = trim($data['message'] ?? '');
        $doctor_id = $data['doctor_id'] ?? null;
        $clinicid = $data['clinic_id'] ?? null;

        if (!$subject || !$message) {
            Response::error('Le sujet et le message sont obligatoires', 422);
        }

        if ($doctor_id && $clinicid) {
            Response::error('Un ticket ne peut être lié qu\'à un médecin ou une clinique, pas les deux', 422);
        }

        $pdo = Database::getInstance();
        $patientId = self::getPatientId($user['user_id']);
        $ticketId = self::uuid();

        $pdo->prepare("INSERT INTO tickets (id, patient_id, doctor_id, clinic_id, subject, status) VALUES (?, ?, ?, ?, ?, 'OPEN')")
            ->execute([$ticketId, $patientId, $doctor_id, $clinicid, $subject]);

        $pdo->prepare("INSERT INTO ticketmessages (id, ticket_id, sender_type, sender_id, message) VALUES (?, ?, 'patient', ?, ?)")
            ->execute([self::uuid(), $ticketId, $patientId, $message]);

        Response::success(['id' => $ticketId], 'Ticket créé avec succès');
    }

    public static function list(): void {
        $user = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();
        $myId = null;
        $sql = "";
        $params = [];

        if ($user['usertype'] == 0) { // Patient
            $myId = self::getPatientId($user['user_id']);
            $sql = "SELECT t.*, d.fullname as doctorname, c.clinicname 
                    FROM tickets t 
                    LEFT JOIN doctors d ON d.id = t.doctor_id 
                    LEFT JOIN clinics c ON c.id = t.clinic_id 
                    WHERE t.patient_id = ? ORDER BY t.updated_at DESC";
            $params = [$myId];
        } else if ($user['usertype'] == 1) { // Doctor
            $myId = self::getDoctorId($user['user_id']);
            $sql = "SELECT t.*, p.fullname as patientname 
                    FROM tickets t 
                    LEFT JOIN patients p ON p.id = t.patient_id 
                    WHERE t.doctor_id = ? ORDER BY t.updated_at DESC";
            $params = [$myId];
        } else if ($user['usertype'] == 2) {
            $sql = "SELECT t.*, p.fullname as patientname 
                    FROM tickets t 
                    LEFT JOIN patients p ON p.id = t.patient_id 
                    JOIN clinics c ON c.id = t.clinic_id
                    WHERE c.user_id = ? ORDER BY t.updated_at DESC";
            $params = [$user['user_id']];
        }

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::success($results);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public static function get(string $id): void {
        $user = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();

        // Security check: user must be part of the ticket
        $stmt = $pdo->prepare("SELECT * FROM tickets WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) Response::notFound('Ticket non trouvé');

        $myId = null;
        $isAllowed = false;
        if ($user['usertype'] == 0) {
            $myId = self::getPatientId($user['user_id']);
            if ($ticket['patient_id'] === $myId) $isAllowed = true;
        } else if ($user['usertype'] == 1) {
            $myId = self::getDoctorId($user['user_id']);
            if ($ticket['doctor_id'] === $myId) $isAllowed = true;
        } else if ($user['usertype'] == 2) {
            // Check if this ticket belongs to the clinic this user is registered for
            $stmt = $pdo->prepare("
                SELECT 1 FROM clinics 
                WHERE user_id = ? AND id = ? 
                LIMIT 1
            ");
            $stmt->execute([$user['user_id'], $ticket['clinic_id']]);
            if ($stmt->fetch()) $isAllowed = true;
        }

        if (!$isAllowed) Response::error('Accès refusé', 403);

        // Fetch messages
        $stmt = $pdo->prepare("SELECT * FROM ticketmessages WHERE ticket_id = ? ORDER BY created_at ASC");
        $stmt->execute([$id]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Mark as read for the receiver
        $pdo->prepare("UPDATE ticketmessages SET is_read = 1 WHERE ticket_id = ? AND sender_id != ?")
            ->execute([$id, $myId]);

        Response::success([
            'ticket' => $ticket,
            'messages' => $messages
        ]);
    }

    public static function reply(string $id): void {
        $user = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $message = trim($data['message'] ?? '');

        if (!$message) Response::error('Le message est vide', 422);

        $stmt = $pdo->prepare("SELECT * FROM tickets WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$ticket) Response::notFound('Ticket non trouvé');
        if ($ticket['status'] === 'CLOSED') Response::error('Le ticket est fermé', 422);

        $myId = null;
        $type = '';
        if ($user['usertype'] == 0) {
            $myId = self::getPatientId($user['user_id']);
            if ($ticket['patient_id'] !== $myId) Response::error('Accès refusé', 403);
            $type = 'patient';
        } else if ($user['usertype'] == 1) {
            $myId = self::getDoctorId($user['user_id']);
            if ($ticket['doctor_id'] !== $myId) Response::error('Accès refusé', 403);
            $type = 'doctor';
        } else if ($user['usertype'] == 2) {
            $myId = self::getClinicId($user['user_id']);
            if ($ticket['clinic_id'] !== $myId) Response::error('Accès refusé', 403);
            $type = 'clinic';
        }

        $pdo->prepare("INSERT INTO ticketmessages (id, ticket_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?, ?)")
            ->execute([self::uuid(), $id, $type, $myId, $message]);

        // Update ticket status/updated_at
        $newStatus = ($type === 'patient') ? 'OPEN' : 'PENDING';
        $pdo->prepare("UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
            ->execute([$newStatus, $id]);

        Response::success(null, 'Réponse envoyée');
    }

    public static function close(string $id): void {
        $user = AuthMiddleware::authenticate();
        if ($user['usertype'] == 0) Response::error('Action non autorisée', 403);

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM tickets WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$ticket) Response::notFound('Ticket non trouvé');

        $myId = null;
        if ($user['usertype'] == 1) {
            $myId = self::getDoctorId($user['user_id']);
            if ($ticket['doctor_id'] !== $myId) Response::error('Accès refusé', 403);
        } else if ($user['usertype'] == 2) {
            $myId = self::getClinicId($user['user_id']);
            if ($ticket['clinic_id'] !== $myId) Response::error('Accès refusé', 403);
        }

        $pdo->prepare("UPDATE tickets SET status = 'CLOSED' WHERE id = ?")
            ->execute([$id]);

        Response::success(null, 'Ticket fermé');
    }

    private static function getPatientId(string $userId): string {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: '';
    }

    private static function getDoctorId(string $userId): string {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: '';
    }

    private static function getClinicId(string $userId): string {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id FROM clinics WHERE user_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: '';
    }

    private static function uuid(): string {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
