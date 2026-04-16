<?php
// ============================================================
// controllers/ChatController.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/UUIDHelper.php';

class ChatController {

    // GET /api/chat/threads
    public static function getThreads(): void {
        $session = AuthMiddleware::patientOnly();
        $pdo     = Database::getInstance();

        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound();

        $stmt = $pdo->prepare("
            SELECT mt.*,
                   d.FullName as DoctorName, d.Email as DoctorEmail,
                   s.NameFr as SpecialtyFr,
                   (SELECT ContentMessage FROM Messages WHERE MessageThread_id = mt.ID ORDER BY DateSend DESC LIMIT 1) as LastMessage,
                   (SELECT DateSend FROM Messages WHERE MessageThread_id = mt.ID ORDER BY DateSend DESC LIMIT 1) as LastMessageDate
            FROM MessageThreads mt
            JOIN Doctors d ON d.ID = mt.Doctor_id
            LEFT JOIN Specialties s ON s.ID = d.Specialtie_id
            WHERE mt.Patient_id = ?
            ORDER BY LastMessageDate DESC
        ");
        $stmt->execute([$patient['ID']]);
        Response::success($stmt->fetchAll());
    }

    // POST /api/chat/threads
    // Body: { doctor_id, subject }
    public static function createThread(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo     = Database::getInstance();

        if (empty($data['doctor_id'])) Response::error("doctor_id requis", 422);

        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound();

        // Check existing open thread
        $stmt = $pdo->prepare("
            SELECT ID FROM MessageThreads
            WHERE Patient_id = ? AND Doctor_id = ? AND IsClose = 0
            LIMIT 1
        ");
        $stmt->execute([$patient['ID'], $data['doctor_id']]);
        $existing = $stmt->fetch();
        if ($existing) {
            Response::success(['thread_id' => $existing['ID']], 'Thread existant');
        }

        $threadId = UUIDHelper::generate();
        $pdo->prepare("
            INSERT INTO MessageThreads (ID, Patient_id, Doctor_id, ObjectMessage, IsClose, DateCreate)
            VALUES (?, ?, ?, ?, 0, NOW())
        ")->execute([
            $threadId,
            $patient['ID'],
            $data['doctor_id'],
            $data['subject'] ?? 'Consultation',
        ]);

        Response::success(['thread_id' => $threadId], 'Discussion créée', 201);
    }

    // GET /api/chat/threads/{id}/messages
    public static function getMessages(string $threadId): void {
        $session = AuthMiddleware::authenticate();
        $pdo     = Database::getInstance();

        // Verify access
        $stmt = $pdo->prepare("SELECT * FROM MessageThreads WHERE ID = ? LIMIT 1");
        $stmt->execute([$threadId]);
        $thread = $stmt->fetch();
        if (!$thread) Response::notFound();

        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient || $thread['Patient_id'] !== $patient['ID']) {
            Response::error('Accès interdit', 403);
        }

        $stmt = $pdo->prepare("
            SELECT * FROM Messages
            WHERE MessageThread_id = ?
            ORDER BY DateSend ASC
        ");
        $stmt->execute([$threadId]);
        Response::success($stmt->fetchAll());
    }

    // POST /api/chat/threads/{id}/messages
    // Body: { content }
    public static function sendMessage(string $threadId): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo     = Database::getInstance();

        if (empty($data['content'])) Response::error('Contenu du message requis', 422);

        $stmt = $pdo->prepare("SELECT * FROM MessageThreads WHERE ID = ? LIMIT 1");
        $stmt->execute([$threadId]);
        $thread = $stmt->fetch();
        if (!$thread) Response::notFound();

        if ($thread['IsClose']) Response::error('Cette discussion est fermée', 400);

        $stmt = $pdo->prepare("SELECT ID FROM Patients WHERE User_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient || $thread['Patient_id'] !== $patient['ID']) {
            Response::error('Accès interdit', 403);
        }

        $msgId = UUIDHelper::generate();
        $pdo->prepare("
            INSERT INTO Messages (ID, MessageThread_id, ContentMessage, DateSend, IsDoctor)
            VALUES (?, ?, ?, NOW(), 0)
        ")->execute([$msgId, $threadId, trim($data['content'])]);

        Response::success(['message_id' => $msgId], 'Message envoyé', 201);
    }
}
