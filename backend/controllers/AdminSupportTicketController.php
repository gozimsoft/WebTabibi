<?php
// ============================================================
// backend/controllers/AdminSupportTicketController.php
// Module: Support Administratif & Réclamations TABIBI
// ============================================================

require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/NotificationHelper.php';

class AdminSupportTicketController {

    // Allowed ticket categories
    public const CATEGORIES = [
        'reclamation'    => 'Réclamation',
        'info'           => "Demande d'information",
        'technical'      => 'Problème technique',
        'account'        => 'Compte / Profil',
        'appointment'    => 'Rendez-vous / Service TABIBI',
        'subscription'   => 'Abonnement / Paiement',
        'administrative' => 'Demande administrative',
        'report'         => 'Signalement',
        'special'        => 'Demande spéciale',
        'other'          => 'Autre'
    ];

    // Allowed statuses
    public const STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
    public const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    // ----------------------------------------------------------
    // USER ENDPOINTS
    // ----------------------------------------------------------

    /**
     * POST /api/support/tickets
     * Any authenticated user (patient, doctor, clinic) creates an admin ticket.
     */
    public static function createUserTicket(): void {
        $user = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $category = trim($data['category'] ?? 'other');
        $subject  = trim($data['subject'] ?? '');
        $message  = trim($data['message'] ?? '');

        if (!array_key_exists($category, self::CATEGORIES)) {
            $category = 'other';
        }

        if (empty($subject) || empty($message)) {
            Response::error('يرجى كتابة موضوع التذكرة وتفاصيل الطلب قبل الإرسال.', 422);
        }

        $userId   = $user['user_id'];
        $userType = (int)$user['usertype'];

        $ticketId     = self::uuid();
        $ticketNumber = self::generateTicketNumber($pdo);

        $pdo->beginTransaction();
        try {
            // Insert ticket
            $stmt = $pdo->prepare("
                INSERT INTO admin_support_tickets (id, ticket_number, user_id, user_type, category, subject, status, priority)
                VALUES (?, ?, ?, ?, ?, ?, 'OPEN', 'MEDIUM')
            ");
            $stmt->execute([$ticketId, $ticketNumber, $userId, $userType, $category, $subject]);

            // Insert initial message
            $msgId = self::uuid();
            $stmtMsg = $pdo->prepare("
                INSERT INTO admin_support_messages (id, ticket_id, sender_id, sender_type, message, is_read)
                VALUES (?, ?, ?, 'user', ?, 0)
            ");
            $stmtMsg->execute([$msgId, $ticketId, $userId, $message]);

            $pdo->commit();

            // Notify Admin & Support users
            try {
                $admins = $pdo->query("SELECT id FROM users WHERE usertype IN (3, 4)")->fetchAll(PDO::FETCH_COLUMN);
                $categoryLabel = self::CATEGORIES[$category] ?? $category;
                foreach ($admins as $adminId) {
                    NotificationHelper::notify(
                        $adminId,
                        "تذكرة دعم جديدة: #$ticketNumber",
                        "طلب دعم جديد من مستخدم [$categoryLabel]: $subject",
                        "admin_ticket"
                    );
                }
            } catch (\Throwable $e) {
                // Non-blocking notification failure
            }

            Response::success([
                'id'            => $ticketId,
                'ticket_number' => $ticketNumber,
                'category'      => $category,
                'subject'       => $subject,
                'status'        => 'OPEN'
            ], 'تم إرسال تذكرتك بنجاح إلى إدارة المنصة برقم #' . $ticketNumber);
        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('فشل إنشاء تذكرة الدعم: ' . $e->getMessage());
        }
    }

    /**
     * GET /api/support/tickets
     * List only tickets created by the authenticated user.
     */
    public static function listUserTickets(): void {
        $user = AuthMiddleware::authenticate();
        $pdo  = Database::getInstance();
        $userId = $user['user_id'];

        $hasPagination = isset($_GET['page']) || isset($_GET['limit']);
        if ($hasPagination) {
            $page   = max(1, (int)($_GET['page'] ?? 1));
            $limit  = max(1, min(100, (int)($_GET['limit'] ?? 10)));
            $offset = ($page - 1) * $limit;

            $countStmt = $pdo->prepare("SELECT COUNT(*) FROM admin_support_tickets WHERE user_id = ?");
            $countStmt->execute([$userId]);
            $total = (int)$countStmt->fetchColumn();

            $stmt = $pdo->prepare("
                SELECT t.*,
                    (SELECT m.message FROM admin_support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
                    (SELECT m.created_at FROM admin_support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message_at,
                    (SELECT m.sender_type FROM admin_support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_sender_type,
                    (SELECT COUNT(*) FROM admin_support_messages m WHERE m.ticket_id = t.id AND m.is_read = 0 AND m.sender_type != 'user') as unread_count
                FROM admin_support_tickets t
                WHERE t.user_id = ?
                ORDER BY t.updated_at DESC
                LIMIT $limit OFFSET $offset
            ");
            $stmt->execute([$userId]);
            $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::success([
                'items'       => $tickets,
                'total'       => $total,
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => max(1, ceil($total / $limit))
            ]);
        }

        // Backward-compatible unpaginated list
        $stmt = $pdo->prepare("
            SELECT t.*,
                (SELECT m.message FROM admin_support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
                (SELECT m.created_at FROM admin_support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message_at,
                (SELECT m.sender_type FROM admin_support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_sender_type,
                (SELECT COUNT(*) FROM admin_support_messages m WHERE m.ticket_id = t.id AND m.is_read = 0 AND m.sender_type != 'user') as unread_count
            FROM admin_support_tickets t
            WHERE t.user_id = ?
            ORDER BY t.updated_at DESC
        ");
        $stmt->execute([$userId]);
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success($tickets);
    }

    /**
     * GET /api/support/tickets/:id
     * Get user ticket conversation. Strict IDOR protection.
     */
    public static function getUserTicket(string $id): void {
        $user = AuthMiddleware::authenticate();
        $pdo  = Database::getInstance();

        $stmt = $pdo->prepare("SELECT * FROM admin_support_tickets WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) {
            Response::notFound('لم يتم العثور على التذكرة المطلوبة.');
        }

        // Strict IDOR Check
        if ($ticket['user_id'] !== $user['user_id']) {
            Response::error('غير مسموح لك بالاطلاع على هذه التذكرة.', 403);
        }

        // Fetch messages
        $stmtM = $pdo->prepare("SELECT * FROM admin_support_messages WHERE ticket_id = ? ORDER BY created_at ASC");
        $stmtM->execute([$id]);
        $messages = $stmtM->fetchAll(PDO::FETCH_ASSOC);

        // Mark admin/support messages as read for this user
        $pdo->prepare("UPDATE admin_support_messages SET is_read = 1 WHERE ticket_id = ? AND sender_type != 'user'")
            ->execute([$id]);

        Response::success([
            'ticket'   => $ticket,
            'messages' => $messages
        ]);
    }

    /**
     * POST /api/support/tickets/:id/reply
     * User reply to ticket.
     */
    public static function userReply(string $id): void {
        $user = AuthMiddleware::authenticate();
        $pdo  = Database::getInstance();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $message = trim($data['message'] ?? '');

        if (empty($message)) {
            Response::error('يرجى كتابة رسالتك قبل الإرسال.', 422);
        }

        $stmt = $pdo->prepare("SELECT * FROM admin_support_tickets WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) {
            Response::notFound('التذكرة غير موجودة.');
        }

        if ($ticket['user_id'] !== $user['user_id']) {
            Response::error('غير مسموح لك بالرد على هذه التذكرة.', 403);
        }

        if ($ticket['status'] === 'CLOSED') {
            Response::error('هذه التذكرة مغلقة نهائياً. يرجى فتح تذكرة جديدة إذا كان لديك استفسار آخر.', 422);
        }

        $msgId = self::uuid();
        $pdo->beginTransaction();
        try {
            $stmtMsg = $pdo->prepare("
                INSERT INTO admin_support_messages (id, ticket_id, sender_id, sender_type, message, is_read)
                VALUES (?, ?, ?, 'user', ?, 0)
            ");
            $stmtMsg->execute([$msgId, $id, $user['user_id'], $message]);

            // Re-open ticket if it was resolved/pending
            $pdo->prepare("UPDATE admin_support_tickets SET status = 'OPEN', updated_at = NOW() WHERE id = ?")
                ->execute([$id]);

            $pdo->commit();

            // Notify admins
            try {
                $admins = $pdo->query("SELECT id FROM users WHERE usertype IN (3, 4)")->fetchAll(PDO::FETCH_COLUMN);
                foreach ($admins as $adminId) {
                    NotificationHelper::notify(
                        $adminId,
                        "رد جديد على التذكرة #{$ticket['ticket_number']}",
                        "أرسل المستخدم رداً جديداً على التذكرة: {$ticket['subject']}",
                        "admin_ticket"
                    );
                }
            } catch (\Throwable $e) {}

            Response::success(null, 'تم إرسال ردك بنجاح.');
        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('فشل إرسال الرد: ' . $e->getMessage());
        }
    }

    // ----------------------------------------------------------
    // ADMIN / SUPPORT ENDPOINTS
    // ----------------------------------------------------------

    /**
     * GET /api/admin/support-tickets
     * Full administrative list with filters and search.
     */
    public static function listAdminTickets(): void {
        AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();

        $status   = strtoupper(trim($_GET['status'] ?? 'ALL'));
        $category = trim($_GET['category'] ?? '');
        $priority = strtoupper(trim($_GET['priority'] ?? ''));
        $search   = trim($_GET['q'] ?? $_GET['search'] ?? '');
        $page     = max(1, (int)($_GET['page'] ?? 1));
        $limit    = max(5, min(100, (int)($_GET['limit'] ?? 20)));
        $offset   = ($page - 1) * $limit;

        // Global status counts
        $countsStmt = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as `open`,
                SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as `in_progress`,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as `pending`,
                SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as `resolved`,
                SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as `closed`,
                (SELECT COUNT(*) FROM admin_support_messages WHERE is_read = 0 AND sender_type = 'user') as unread_messages
            FROM admin_support_tickets
        ");
        $rawCounts = $countsStmt->fetch(PDO::FETCH_ASSOC) ?: [];
        $counts = [
            'TOTAL'           => (int)($rawCounts['total'] ?? 0),
            'OPEN'            => (int)($rawCounts['open'] ?? 0),
            'IN_PROGRESS'     => (int)($rawCounts['in_progress'] ?? 0),
            'PENDING'         => (int)($rawCounts['pending'] ?? 0),
            'RESOLVED'        => (int)($rawCounts['resolved'] ?? 0),
            'CLOSED'          => (int)($rawCounts['closed'] ?? 0),
            'UNREAD_MESSAGES' => (int)($rawCounts['unread_messages'] ?? 0),
        ];

        // Filters
        $where = [];
        $params = [];

        if ($status !== 'ALL' && in_array($status, self::STATUSES)) {
            $where[] = "t.status = ?";
            $params[] = $status;
        }

        if (!empty($category) && array_key_exists($category, self::CATEGORIES)) {
            $where[] = "t.category = ?";
            $params[] = $category;
        }

        if (!empty($priority) && in_array($priority, self::PRIORITIES)) {
            $where[] = "t.priority = ?";
            $params[] = $priority;
        }

        if ($search !== '') {
            $term = "%$search%";
            $where[] = "(t.ticket_number LIKE ? OR t.subject LIKE ? OR u.username LIKE ?)";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $whereClause = !empty($where) ? "WHERE " . implode(' AND ', $where) : "";

        // Total filtered
        $totalStmt = $pdo->prepare("
            SELECT COUNT(*) 
            FROM admin_support_tickets t
            JOIN users u ON u.id = t.user_id
            $whereClause
        ");
        $totalStmt->execute($params);
        $total = (int)$totalStmt->fetchColumn();

        // Query items with requester information
        $query = "
            SELECT t.*,
                u.username as requester_username,
                CASE 
                    WHEN t.user_type = 0 THEN (SELECT fullname FROM patients WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 1 THEN (SELECT fullname FROM doctors WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 2 THEN (SELECT clinicname FROM clinics WHERE user_id = t.user_id LIMIT 1)
                    ELSE u.username
                END as requester_name,
                CASE 
                    WHEN t.user_type = 0 THEN (SELECT phone FROM patients WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 1 THEN (SELECT phone FROM doctors WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 2 THEN (SELECT phone FROM clinics WHERE user_id = t.user_id LIMIT 1)
                    ELSE NULL
                END as requester_phone,
                CASE 
                    WHEN t.user_type = 0 THEN (SELECT email FROM patients WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 1 THEN (SELECT email FROM doctors WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 2 THEN (SELECT email FROM clinics WHERE user_id = t.user_id LIMIT 1)
                    ELSE NULL
                END as requester_email,
                (SELECT m.message FROM admin_support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
                (SELECT m.created_at FROM admin_support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message_at,
                (SELECT m.sender_type FROM admin_support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_sender_type,
                (SELECT COUNT(*) FROM admin_support_messages m WHERE m.ticket_id = t.id AND m.is_read = 0 AND m.sender_type = 'user') as unread_count
            FROM admin_support_tickets t
            JOIN users u ON u.id = t.user_id
            $whereClause
            ORDER BY t.updated_at DESC
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
            'counts'      => $counts
        ]);
    }

    /**
     * GET /api/admin/support-tickets/stats
     * Stats and unread counts for Admin Dashboard badge.
     */
    public static function getAdminStats(): void {
        AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();

        $countsStmt = $pdo->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as `open`,
                SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as `in_progress`,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as `pending`,
                SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as `resolved`,
                SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as `closed`,
                (SELECT COUNT(*) FROM admin_support_messages WHERE is_read = 0 AND sender_type = 'user') as unread_messages
            FROM admin_support_tickets
        ");
        $rawCounts = $countsStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        Response::success([
            'total'           => (int)($rawCounts['total'] ?? 0),
            'open'            => (int)($rawCounts['open'] ?? 0),
            'in_progress'     => (int)($rawCounts['in_progress'] ?? 0),
            'pending'         => (int)($rawCounts['pending'] ?? 0),
            'resolved'        => (int)($rawCounts['resolved'] ?? 0),
            'closed'          => (int)($rawCounts['closed'] ?? 0),
            'unread_messages' => (int)($rawCounts['unread_messages'] ?? 0),
        ]);
    }

    /**
     * GET /api/admin/support-tickets/:id
     * Full ticket details for Admin / Support.
     */
    public static function getAdminTicket(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare("
            SELECT t.*,
                u.username as requester_username,
                CASE 
                    WHEN t.user_type = 0 THEN (SELECT fullname FROM patients WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 1 THEN (SELECT fullname FROM doctors WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 2 THEN (SELECT clinicname FROM clinics WHERE user_id = t.user_id LIMIT 1)
                    ELSE u.username
                END as requester_name,
                CASE 
                    WHEN t.user_type = 0 THEN (SELECT phone FROM patients WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 1 THEN (SELECT phone FROM doctors WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 2 THEN (SELECT phone FROM clinics WHERE user_id = t.user_id LIMIT 1)
                    ELSE NULL
                END as requester_phone,
                CASE 
                    WHEN t.user_type = 0 THEN (SELECT email FROM patients WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 1 THEN (SELECT email FROM doctors WHERE user_id = t.user_id LIMIT 1)
                    WHEN t.user_type = 2 THEN (SELECT email FROM clinics WHERE user_id = t.user_id LIMIT 1)
                    ELSE NULL
                END as requester_email
            FROM admin_support_tickets t
            JOIN users u ON u.id = t.user_id
            WHERE t.id = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) {
            Response::notFound('التذكرة غير موجودة.');
        }

        // Fetch messages
        $stmtM = $pdo->prepare("
            SELECT m.*, u.username as sender_username
            FROM admin_support_messages m
            LEFT JOIN users u ON u.id = m.sender_id
            WHERE m.ticket_id = ?
            ORDER BY m.created_at ASC
        ");
        $stmtM->execute([$id]);
        $messages = $stmtM->fetchAll(PDO::FETCH_ASSOC);

        // Mark user messages as read for admin
        $pdo->prepare("UPDATE admin_support_messages SET is_read = 1 WHERE ticket_id = ? AND sender_type = 'user'")
            ->execute([$id]);

        Response::success([
            'ticket'   => $ticket,
            'messages' => $messages
        ]);
    }

    /**
     * POST /api/admin/support-tickets/:id/reply
     * Admin/Support reply to user.
     */
    public static function adminReply(string $id): void {
        $admin = AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $message = trim($data['message'] ?? '');
        $newStatus = trim($data['status'] ?? 'PENDING');

        if (empty($message)) {
            Response::error('يرجى كتابة نص الرد قبل الإرسال.', 422);
        }

        if (!in_array($newStatus, self::STATUSES)) {
            $newStatus = 'PENDING';
        }

        $stmt = $pdo->prepare("SELECT * FROM admin_support_tickets WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) {
            Response::notFound('التذكرة غير موجودة.');
        }

        $senderType = ((int)$admin['usertype'] === 4) ? 'support' : 'admin';
        $msgId = self::uuid();

        $pdo->beginTransaction();
        try {
            $stmtMsg = $pdo->prepare("
                INSERT INTO admin_support_messages (id, ticket_id, sender_id, sender_type, message, is_read)
                VALUES (?, ?, ?, ?, ?, 0)
            ");
            $stmtMsg->execute([$msgId, $id, $admin['user_id'], $senderType, $message]);

            $pdo->prepare("UPDATE admin_support_tickets SET status = ?, updated_at = NOW() WHERE id = ?")
                ->execute([$newStatus, $id]);

            $pdo->commit();

            // Notify user
            try {
                NotificationHelper::notify(
                    $ticket['user_id'],
                    "رد من إدارة المنصة على التذكرة #{$ticket['ticket_number']}",
                    "تلقيت رداً جديداً من الدعم الإداري بخصوص: {$ticket['subject']}",
                    "admin_ticket"
                );
            } catch (\Throwable $e) {}

            Response::success(null, 'تم إرسال الرد وتحديث حالة التذكرة بنجاح.');
        } catch (\Exception $e) {
            $pdo->rollBack();
            Response::serverError('فشل إرسال الرد: ' . $e->getMessage());
        }
    }

    /**
     * PUT /api/admin/support-tickets/:id/status
     * Admin/Support updates ticket status and/or priority.
     */
    public static function updateStatus(string $id): void {
        AuthMiddleware::adminOnly();
        $pdo = Database::getInstance();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $status   = strtoupper(trim($data['status'] ?? ''));
        $priority = strtoupper(trim($data['priority'] ?? ''));

        $stmt = $pdo->prepare("SELECT * FROM admin_support_tickets WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) {
            Response::notFound('التذكرة غير موجودة.');
        }

        $updates = [];
        $params  = [];

        if (!empty($status) && in_array($status, self::STATUSES)) {
            $updates[] = "status = ?";
            $params[]  = $status;
        }

        if (!empty($priority) && in_array($priority, self::PRIORITIES)) {
            $updates[] = "priority = ?";
            $params[]  = $priority;
        }

        if (empty($updates)) {
            Response::error('لا توجد بيانات صالحة للتحديث.', 422);
        }

        $updates[] = "updated_at = NOW()";
        $params[] = $id;

        $sql = "UPDATE admin_support_tickets SET " . implode(', ', $updates) . " WHERE id = ?";
        $pdo->prepare($sql)->execute($params);

        // Notify user if status changed to RESOLVED or CLOSED
        if (!empty($status) && in_array($status, ['RESOLVED', 'CLOSED'])) {
            try {
                $statusLabel = ($status === 'RESOLVED') ? 'تم حل المشكلة' : 'تم إغلاق التذكرة';
                NotificationHelper::notify(
                    $ticket['user_id'],
                    "تحديث حالة التذكرة #{$ticket['ticket_number']}",
                    "تم تحديث حالة طلبك إلى: $statusLabel",
                    "admin_ticket"
                );
            } catch (\Throwable $e) {}
        }

        Response::success(null, 'تم تحديث التذكرة بنجاح.');
    }

    // ----------------------------------------------------------
    // UTILS
    // ----------------------------------------------------------

    private static function generateTicketNumber(PDO $pdo): string {
        $prefix = 'ADM-' . date('ym') . '-';
        $rand = mt_rand(1000, 9999);
        $candidate = $prefix . $rand;

        // Ensure uniqueness
        for ($i = 0; $i < 5; $i++) {
            $stmt = $pdo->prepare("SELECT 1 FROM admin_support_tickets WHERE ticket_number = ? LIMIT 1");
            $stmt->execute([$candidate]);
            if (!$stmt->fetch()) {
                return $candidate;
            }
            $candidate = $prefix . mt_rand(1000, 9999);
        }
        return $prefix . substr(self::uuid(), 0, 4);
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
