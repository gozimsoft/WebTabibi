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

        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        $stmt = $pdo->prepare("
            SELECT mt.*,
                   d.fullname as doctorname, d.email as doctoremail,
                   s.namefr as specialtyfr,
                   (SELECT ContentMessage FROM messages WHERE MessageThread_id = mt.id ORDER BY DateSend DESC LIMIT 1) as LastMessage,
                   (SELECT DateSend FROM messages WHERE MessageThread_id = mt.id ORDER BY DateSend DESC LIMIT 1) as LastMessageDate
            FROM messagethreads mt
            JOIN doctors d ON d.id = mt.doctor_id
            LEFT JOIN specialties s ON s.id = d.specialtie_id
            WHERE mt.patient_id = ?
            ORDER BY LastMessageDate DESC
        ");
        $stmt->execute([$patient['id']]);
        Response::success($stmt->fetchAll());
    }

    // POST /api/chat/threads
    // Body: { doctor_id, subject }
    public static function createThread(): void {
        $session = AuthMiddleware::patientOnly();
        $data    = json_decode(file_get_contents('php://input'), true) ?? [];
        $pdo     = Database::getInstance();

        if (empty($data['doctor_id'])) Response::error("معرف الطبيب مطلوب لبدء المحادثة.", 422);

        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient) Response::notFound('لم يتم العثور على الملف الشخصي للمريض.');

        // Check existing open thread
        $stmt = $pdo->prepare("
            SELECT id FROM messagethreads
            WHERE patient_id = ? AND doctor_id = ? AND isclose = 0
            LIMIT 1
        ");
        $stmt->execute([$patient['id'], $data['doctor_id']]);
        $existing = $stmt->fetch();
        if ($existing) {
            Response::success(['thread_id' => $existing['id']], 'المحادثة موجودة بالفعل.');
        }

        $threadId = UUIDHelper::generate();
        $pdo->prepare("
            INSERT INTO messagethreads (id, patient_id, doctor_id, ObjectMessage, isclose, DateCreate)
            VALUES (?, ?, ?, ?, 0, NOW())
        ")->execute([
            $threadId,
            $patient['id'],
            $data['doctor_id'],
            $data['subject'] ?? 'consultation',
        ]);

        Response::success(['thread_id' => $threadId], 'تم إنشاء المحادثة بنجاح.', 201);
    }

    // GET /api/chat/threads/{id}/messages
    public static function getMessages(string $threadId): void {
        $session = AuthMiddleware::authenticate();
        $pdo     = Database::getInstance();

        // Verify access
        $stmt = $pdo->prepare("SELECT * FROM messagethreads WHERE id = ? LIMIT 1");
        $stmt->execute([$threadId]);
        $thread = $stmt->fetch();
        if (!$thread) Response::notFound('المحادثة المطلوبة غير موجودة.');

        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient || $thread['patient_id'] !== $patient['id']) {
            Response::error('غير مسموح لك بالوصول إلى هذه المحادثة.', 403);
        }

        $stmt = $pdo->prepare("
            SELECT * FROM messages
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

        if (empty($data['content'])) Response::error('محتوى الرسالة مطلوب ولا يمكن إرسال رسالة فارغة.', 422);

        $stmt = $pdo->prepare("SELECT * FROM messagethreads WHERE id = ? LIMIT 1");
        $stmt->execute([$threadId]);
        $thread = $stmt->fetch();
        if (!$thread) Response::notFound('المحادثة المطلوبة غير موجودة.');

        if ($thread['isclose']) Response::error('هذه المحادثة مغلقة ولا يمكن إرسال رسائل فيها.', 400);

        $stmt = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmt->execute([$session['user_id']]);
        $patient = $stmt->fetch();
        if (!$patient || $thread['patient_id'] !== $patient['id']) {
            Response::error('غير مسموح لك بالوصول إلى هذه المحادثة.', 403);
        }

        $msgId = UUIDHelper::generate();
        $pdo->prepare("
            INSERT INTO messages (id, MessageThread_id, ContentMessage, DateSend, IsDoctor)
            VALUES (?, ?, ?, NOW(), 0)
        ")->execute([$msgId, $threadId, trim($data['content'])]);

        // إرسال تنبيه للطبيب عند استلام رسالة جديدة من المريض
        require_once __DIR__ . '/../helpers/NotificationHelper.php';
        try {
            $stmt = $pdo->prepare("
                SELECT d.user_id as doctor_user_id
                FROM messagethreads mt
                JOIN doctors d ON d.id = mt.doctor_id
                WHERE mt.id = ?
                LIMIT 1
            ");
            $stmt->execute([$threadId]);
            $threadData = $stmt->fetch();
            if ($threadData) {
                $msgSnippet = mb_strimwidth(trim($data['content']), 0, 50, "...");
                NotificationHelper::notify(
                    $threadData['doctor_user_id'],
                    "رسالة جديدة",
                    "وصلتك رسالة جديدة من المريض: " . ($patient['fullname'] ?? '') . "\n\"" . $msgSnippet . "\"",
                    "chat"
                );
            }
        } catch (Throwable $e) {
            error_log("Failed to send chat notification: " . $e->getMessage());
        }

        Response::success(['message_id' => $msgId], 'تم إرسال الرسالة بنجاح.', 201);
    }
}
