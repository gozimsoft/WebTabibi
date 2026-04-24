<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class TicketController {

    public static function create(): void {
        $user = AuthMiddleware::authenticate();
        if ($user['UserType'] != 0) { // Only patients can start tickets
            Response::error('Seuls les patients peuvent créer des tickets', 403);
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $subject = trim($data['subject'] ?? '');
        $message = trim($data['message'] ?? '');
        $doctorId = $data['doctor_id'] ?? null;
        $clinicId = $data['clinic_id'] ?? null;

        if (!$subject || !$message) {
            Response::error('Le sujet et le message sont obligatoires', 422);
        }

        if ($doctorId && $clinicId) {
            Response::error('Un ticket ne peut être lié qu\'à un médecin ou une clinique, pas les deux', 422);
        }

        $pdo = Database::getInstance();
        $patientId = self::getPatientId($user['user_id']);
        $ticketId = self::uuid();

        $pdo->prepare("INSERT INTO Tickets (ID, Patient_ID, Doctor_ID, Clinic_ID, Subject, Status) VALUES (?, ?, ?, ?, ?, 'OPEN')")
            ->execute([$ticketId, $patientId, $doctorId, $clinicId, $subject]);

        $pdo->prepare("INSERT INTO TicketMessages (ID, Ticket_ID, Sender_Type, Sender_ID, Message) VALUES (?, ?, 'patient', ?, ?)")
            ->execute([self::uuid(), $ticketId, $patientId, $message]);

        Response::success(['id' => $ticketId], 'Ticket créé avec succès');
    }

    public static function list(): void {
        $user = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();
        $myId = null;
        $sql = "";
        $params = [];

        if ($user['UserType'] == 0) { // Patient
            $myId = self::getPatientId($user['user_id']);
            $sql = "SELECT t.*, d.FullName as DoctorName, c.ClinicName 
                    FROM Tickets t 
                    LEFT JOIN Doctors d ON d.ID = t.Doctor_ID 
                    LEFT JOIN Clinics c ON c.ID = t.Clinic_ID 
                    WHERE t.Patient_ID = ? ORDER BY t.Updated_At DESC";
            $params = [$myId];
        } else if ($user['UserType'] == 1) { // Doctor
            $myId = self::getDoctorId($user['user_id']);
            $sql = "SELECT t.*, p.FullName as PatientName 
                    FROM Tickets t 
                    LEFT JOIN Patients p ON p.ID = t.Patient_ID 
                    WHERE t.Doctor_ID = ? ORDER BY t.Updated_At DESC";
            $params = [$myId];
        } else if ($user['UserType'] == 2) { // Clinic
            $sql = "SELECT t.*, p.FullName as PatientName 
                    FROM Tickets t 
                    LEFT JOIN Patients p ON p.ID = t.Patient_ID 
                    JOIN ClinicRegistrations cr ON cr.Clinic_ID = t.Clinic_ID
                    WHERE cr.User_ID = ? ORDER BY t.Updated_At DESC";
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
        $stmt = $pdo->prepare("SELECT * FROM Tickets WHERE ID = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) Response::notFound('Ticket non trouvé');

        $myId = null;
        $isAllowed = false;
        if ($user['UserType'] == 0) {
            $myId = self::getPatientId($user['user_id']);
            if ($ticket['Patient_ID'] === $myId) $isAllowed = true;
        } else if ($user['UserType'] == 1) {
            $myId = self::getDoctorId($user['user_id']);
            if ($ticket['Doctor_ID'] === $myId) $isAllowed = true;
        } else if ($user['UserType'] == 2) {
            // Check if this ticket belongs to the clinic this user is registered for
            $stmt = $pdo->prepare("
                SELECT 1 FROM ClinicRegistrations 
                WHERE User_ID = ? AND Clinic_ID = ? 
                LIMIT 1
            ");
            $stmt->execute([$user['user_id'], $ticket['Clinic_ID']]);
            if ($stmt->fetch()) $isAllowed = true;
        }

        if (!$isAllowed) Response::error('Accès refusé', 403);

        // Fetch messages
        $stmt = $pdo->prepare("SELECT * FROM TicketMessages WHERE Ticket_ID = ? ORDER BY Created_At ASC");
        $stmt->execute([$id]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Mark as read for the receiver
        $pdo->prepare("UPDATE TicketMessages SET Is_Read = 1 WHERE Ticket_ID = ? AND Sender_ID != ?")
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

        $stmt = $pdo->prepare("SELECT * FROM Tickets WHERE ID = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$ticket) Response::notFound('Ticket non trouvé');
        if ($ticket['Status'] === 'CLOSED') Response::error('Le ticket est fermé', 422);

        $myId = null;
        $type = '';
        if ($user['UserType'] == 0) {
            $myId = self::getPatientId($user['user_id']);
            if ($ticket['Patient_ID'] !== $myId) Response::error('Accès refusé', 403);
            $type = 'patient';
        } else if ($user['UserType'] == 1) {
            $myId = self::getDoctorId($user['user_id']);
            if ($ticket['Doctor_ID'] !== $myId) Response::error('Accès refusé', 403);
            $type = 'doctor';
        } else if ($user['UserType'] == 2) {
            $myId = self::getClinicId($user['user_id']);
            if ($ticket['Clinic_ID'] !== $myId) Response::error('Accès refusé', 403);
            $type = 'clinic';
        }

        $pdo->prepare("INSERT INTO TicketMessages (ID, Ticket_ID, Sender_Type, Sender_ID, Message) VALUES (?, ?, ?, ?, ?)")
            ->execute([self::uuid(), $id, $type, $myId, $message]);

        // Update ticket status/updated_at
        $newStatus = ($type === 'patient') ? 'OPEN' : 'PENDING';
        $pdo->prepare("UPDATE Tickets SET Status = ?, Updated_At = CURRENT_TIMESTAMP WHERE ID = ?")
            ->execute([$newStatus, $id]);

        Response::success(null, 'Réponse envoyée');
    }

    public static function close(string $id): void {
        $user = AuthMiddleware::authenticate();
        if ($user['UserType'] == 0) Response::error('Action non autorisée', 403);

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM Tickets WHERE ID = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$ticket) Response::notFound('Ticket non trouvé');

        $myId = null;
        if ($user['UserType'] == 1) {
            $myId = self::getDoctorId($user['user_id']);
            if ($ticket['Doctor_ID'] !== $myId) Response::error('Accès refusé', 403);
        } else if ($user['UserType'] == 2) {
            $myId = self::getClinicId($user['user_id']);
            if ($ticket['Clinic_ID'] !== $myId) Response::error('Accès refusé', 403);
        }

        $pdo->prepare("UPDATE Tickets SET Status = 'CLOSED' WHERE ID = ?")
            ->execute([$id]);

        Response::success(null, 'Ticket fermé');
    }

    private static function getPatientId(string $userId): string {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: '';
    }

    private static function getDoctorId(string $userId): string {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT ID FROM Doctors WHERE User_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: '';
    }

    private static function getClinicId(string $userId): string {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT Clinic_ID FROM ClinicRegistrations WHERE User_ID = ? LIMIT 1");
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
