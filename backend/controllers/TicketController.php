<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class TicketController {

    public static function create(): void {
        $user = AuthMiddleware::authenticate();
        if ($user['usertype'] != 0) { // Only patients can start tickets
            // رسالة بشرية: فقط المرضى يمكنهم فتح تذكرة دعم
            Response::error('فتح تذاكر الدعم متاح للمرضى فقط. يرجى تسجيل الدخول بحساب مريض.', 403);
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $subject = trim($data['subject'] ?? '');
        $message = trim($data['message'] ?? '');
        $doctor_id = $data['doctor_id'] ?? null;
        $clinicid = $data['clinic_id'] ?? null;

        if (!$subject || !$message) {
            // رسالة بشرية: الموضوع والرسالة مطلوبان
            Response::error('يرجى كتابة موضوع التذكرة ورسالة الاستفسار قبل الإرسال.', 422);
        }

        if ($doctor_id && $clinicid) {
            Response::error('لا يمكن ربط تذكرة الدعم بالطبيب والعيادة معاً، يرجى اختيار جهة واحدة.', 422);
        }

        $pdo = Database::getInstance();
        $patientId = self::getPatientId($user['user_id']);

        // التحقق من عدم وجود تذكرة مفتوحة مسبقاً لمنع إرسال تذاكر غير محدودة لنفس الطبيب أو العيادة
        if ($doctor_id) {
            $checkStmt = $pdo->prepare("SELECT id, subject, status FROM tickets WHERE patient_id = ? AND doctor_id = ? AND UPPER(status) != 'CLOSED' ORDER BY updated_at DESC LIMIT 1");
            $checkStmt->execute([$patientId, $doctor_id]);
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                Response::error(
                    'لديك بالفعل تذكرة مفتوحة قيد المعالجة مع هذا الطبيب ("' . htmlspecialchars($existing['subject']) . '"). يرجى متابعة المحادثة عبر التذكرة الحالية أو انتظار إغلاقها.',
                    409,
                    ['existing_ticket_id' => $existing['id'], 'subject' => $existing['subject']]
                );
            }
        } else if ($clinicid) {
            $checkStmt = $pdo->prepare("SELECT id, subject, status FROM tickets WHERE patient_id = ? AND clinic_id = ? AND UPPER(status) != 'CLOSED' ORDER BY updated_at DESC LIMIT 1");
            $checkStmt->execute([$patientId, $clinicid]);
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                Response::error(
                    'لديك بالفعل تذكرة مفتوحة قيد المعالجة مع هذه العيادة ("' . htmlspecialchars($existing['subject']) . '"). يرجى متابعة المحادثة عبر التذكرة الحالية أو انتظار إغلاقها.',
                    409,
                    ['existing_ticket_id' => $existing['id'], 'subject' => $existing['subject']]
                );
            }
        } else {
            $checkStmt = $pdo->prepare("SELECT id, subject, status FROM tickets WHERE patient_id = ? AND doctor_id IS NULL AND clinic_id IS NULL AND UPPER(status) != 'CLOSED' ORDER BY updated_at DESC LIMIT 1");
            $checkStmt->execute([$patientId]);
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                Response::error(
                    'لديك بالفعل تذكرة دعم فني عامة مفتوحة حالياً ("' . htmlspecialchars($existing['subject']) . '"). يرجى متابعة التواصل من خلالها.',
                    409,
                    ['existing_ticket_id' => $existing['id'], 'subject' => $existing['subject']]
                );
            }
        }

        $ticketId = self::uuid();

        $pdo->prepare("INSERT INTO tickets (id, patient_id, doctor_id, clinic_id, subject, status) VALUES (?, ?, ?, ?, ?, 'OPEN')")
            ->execute([$ticketId, $patientId, $doctor_id, $clinicid, $subject]);

        $pdo->prepare("INSERT INTO ticketmessages (id, ticket_id, sender_type, sender_id, message) VALUES (?, ?, 'patient', ?, ?)")
            ->execute([self::uuid(), $ticketId, $patientId, $message]);

        // إرسال تنبيه للطبيب أو العيادة المستلمة
        try {
            require_once __DIR__ . '/../helpers/NotificationHelper.php';
            $patStmt = $pdo->prepare("SELECT fullname FROM patients WHERE id = ? LIMIT 1");
            $patStmt->execute([$patientId]);
            $patientName = $patStmt->fetchColumn() ?: 'المريض';

            if ($doctor_id) {
                $docStmt = $pdo->prepare("SELECT user_id FROM doctors WHERE id = ? LIMIT 1");
                $docStmt->execute([$doctor_id]);
                $docUserId = $docStmt->fetchColumn();
                if ($docUserId) {
                    NotificationHelper::notify(
                        $docUserId,
                        "رسالة جديدة من مريض",
                        "أرسل لك المريض $patientName استفساراً جديداً: $subject",
                        "ticket"
                    );
                }
            } else if ($clinicid) {
                $cliStmt = $pdo->prepare("SELECT user_id FROM clinics WHERE id = ? LIMIT 1");
                $cliStmt->execute([$clinicid]);
                $cliUserId = $cliStmt->fetchColumn();
                if ($cliUserId) {
                    NotificationHelper::notify(
                        $cliUserId,
                        "رسالة جديدة من مريض",
                        "أرسل لكم المريض $patientName استفساراً جديداً: $subject",
                        "ticket"
                    );
                }
            }
        } catch (Throwable $e) {
            error_log("Failed to send ticket notification: " . $e->getMessage());
        }

        Response::success(['id' => $ticketId], 'تم إنشاء تذكرة الدعم بنجاح.');
    }

    public static function checkOpen(): void {
        $user = AuthMiddleware::authenticate();
        if ($user['usertype'] != 0) {
            Response::error('متاح للمرضى فقط', 403);
        }

        $pdo = Database::getInstance();
        $patientId = self::getPatientId($user['user_id']);
        $doctor_id = $_GET['doctor_id'] ?? null;
        $clinicid = $_GET['clinic_id'] ?? null;

        $ticket = null;
        $recipientName = null;

        if ($doctor_id) {
            $stmt = $pdo->prepare("SELECT t.id, t.subject, t.status, t.created_at, t.updated_at, d.fullname as doctorname 
                                    FROM tickets t 
                                    LEFT JOIN doctors d ON d.id = t.doctor_id 
                                    WHERE t.patient_id = ? AND t.doctor_id = ? AND UPPER(t.status) != 'CLOSED' 
                                    ORDER BY t.updated_at DESC LIMIT 1");
            $stmt->execute([$patientId, $doctor_id]);
            $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$ticket) {
                $dStmt = $pdo->prepare("SELECT fullname FROM doctors WHERE id = ? LIMIT 1");
                $dStmt->execute([$doctor_id]);
                $recipientName = $dStmt->fetchColumn() ?: null;
            } else {
                $recipientName = $ticket['doctorname'] ?? null;
            }
        } else if ($clinicid) {
            $stmt = $pdo->prepare("SELECT t.id, t.subject, t.status, t.created_at, t.updated_at, c.clinicname 
                                    FROM tickets t 
                                    LEFT JOIN clinics c ON c.id = t.clinic_id 
                                    WHERE t.patient_id = ? AND t.clinic_id = ? AND UPPER(t.status) != 'CLOSED' 
                                    ORDER BY t.updated_at DESC LIMIT 1");
            $stmt->execute([$patientId, $clinicid]);
            $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$ticket) {
                $cStmt = $pdo->prepare("SELECT clinicname FROM clinics WHERE id = ? LIMIT 1");
                $cStmt->execute([$clinicid]);
                $recipientName = $cStmt->fetchColumn() ?: null;
            } else {
                $recipientName = $ticket['clinicname'] ?? null;
            }
        } else {
            $stmt = $pdo->prepare("SELECT t.id, t.subject, t.status, t.created_at, t.updated_at 
                                    FROM tickets t 
                                    WHERE t.patient_id = ? AND t.doctor_id IS NULL AND t.clinic_id IS NULL AND UPPER(t.status) != 'CLOSED' 
                                    ORDER BY t.updated_at DESC LIMIT 1");
            $stmt->execute([$patientId]);
            $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        Response::success([
            'has_open_ticket' => (bool)$ticket,
            'ticket' => $ticket ?: null,
            'recipient_name' => $recipientName
        ]);
    }

    public static function list(): void {
        $user = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();
        $myId = null;
        $sql = "";
        $params = [];

        if ($user['usertype'] == 0) { // Patient
            $myId = self::getPatientId($user['user_id']);
            $sql = "SELECT t.*, 
                        d.fullname as doctorname, 
                        d.phone as doctor_phone,
                        c.clinicname,
                        (SELECT tm.message FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_message,
                        (SELECT tm.created_at FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_message_at,
                        (SELECT tm.sender_type FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_sender_type,
                        (SELECT COUNT(*) FROM ticketmessages tm WHERE tm.ticket_id = t.id AND tm.is_read = 0 AND tm.sender_type != 'patient') as unread_count
                    FROM tickets t 
                    LEFT JOIN doctors d ON d.id = t.doctor_id 
                    LEFT JOIN clinics c ON c.id = t.clinic_id 
                    WHERE t.patient_id = ? ORDER BY t.updated_at DESC";
            $params = [$myId];
        } else if ($user['usertype'] == 1) { // Doctor
            $myId = self::getDoctorId($user['user_id']);
            $sql = "SELECT t.*, 
                        p.fullname as patientname,
                        p.phone as patient_phone,
                        p.email as patient_email,
                        (SELECT tm.message FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_message,
                        (SELECT tm.created_at FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_message_at,
                        (SELECT tm.sender_type FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_sender_type,
                        (SELECT COUNT(*) FROM ticketmessages tm WHERE tm.ticket_id = t.id AND tm.is_read = 0 AND tm.sender_type != 'doctor') as unread_count
                    FROM tickets t 
                    LEFT JOIN patients p ON p.id = t.patient_id 
                    WHERE t.doctor_id = ? ORDER BY t.updated_at DESC";
            $params = [$myId];
        } else if ($user['usertype'] == 2) { // Clinic
            $myId = self::getClinicId($user['user_id']);
            $sql = "SELECT t.*, 
                        p.fullname as patientname,
                        p.phone as patient_phone,
                        p.email as patient_email,
                        (SELECT tm.message FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_message,
                        (SELECT tm.created_at FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_message_at,
                        (SELECT tm.sender_type FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_sender_type,
                        (SELECT COUNT(*) FROM ticketmessages tm WHERE tm.ticket_id = t.id AND tm.is_read = 0 AND tm.sender_type != 'clinic') as unread_count
                    FROM tickets t 
                    LEFT JOIN patients p ON p.id = t.patient_id 
                    JOIN clinics c ON c.id = t.clinic_id
                    WHERE c.user_id = ? ORDER BY t.updated_at DESC";
            $params = [$user['user_id']];
        } else if ($user['usertype'] == 3 || $user['usertype'] == 4) { // Admin & Support - see all tickets
            $sql = "SELECT t.*, 
                        p.fullname as patientname,
                        p.phone as patient_phone,
                        p.email as patient_email,
                        d.fullname as doctorname,
                        d.phone as doctor_phone,
                        c.clinicname,
                        (SELECT tm.message FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_message,
                        (SELECT tm.created_at FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_message_at,
                        (SELECT tm.sender_type FROM ticketmessages tm WHERE tm.ticket_id = t.id ORDER BY tm.created_at DESC LIMIT 1) as last_sender_type,
                        (SELECT COUNT(*) FROM ticketmessages tm WHERE tm.ticket_id = t.id AND tm.is_read = 0 AND tm.sender_type != 'admin') as unread_count
                    FROM tickets t 
                    LEFT JOIN patients p ON p.id = t.patient_id 
                    LEFT JOIN doctors d ON d.id = t.doctor_id 
                    LEFT JOIN clinics c ON c.id = t.clinic_id 
                    ORDER BY t.updated_at DESC";
            $params = [];
        }

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::success($results);
        } catch (\Throwable $e) {
            // رسالة بشرية: خطأ عند جلب التذاكر
            Response::error('حدث خطأ أثناء جلب قائمة تذاكر الدعم. يرجى المحاولة مرة أخرى.', 500);
        }
    }

    public static function get(string $id): void {
        $user = AuthMiddleware::authenticate();
        $pdo = Database::getInstance();

        // Security check: user must be part of the ticket (or admin)
        $stmt = $pdo->prepare("SELECT t.*, 
                p.fullname as patientname, p.phone as patient_phone, p.email as patient_email,
                d.fullname as doctorname, d.phone as doctor_phone, c.clinicname
            FROM tickets t 
            LEFT JOIN patients p ON p.id = t.patient_id
            LEFT JOIN doctors d ON d.id = t.doctor_id
            LEFT JOIN clinics c ON c.id = t.clinic_id
            WHERE t.id = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) Response::notFound('لم يتم العثور على التذكرة المطلوبة.');

        $myId = null;
        $isAllowed = false;
        if ($user['usertype'] == 0) {
            $myId = self::getPatientId($user['user_id']);
            if ($ticket['patient_id'] === $myId) $isAllowed = true;
        } else if ($user['usertype'] == 1) {
            $myId = self::getDoctorId($user['user_id']);
            if ($ticket['doctor_id'] === $myId) $isAllowed = true;
        } else if ($user['usertype'] == 2) {
            $myId = self::getClinicId($user['user_id']);
            if ($ticket['clinic_id'] === $myId) $isAllowed = true;
        } else if ($user['usertype'] == 3 || $user['usertype'] == 4) {
            $isAllowed = true; // Admin & Support have full access
        }

        if (!$isAllowed) Response::error('ليس لديك صلاحية الاطلاع على هذه التذكرة.', 403);

        // Fetch messages
        $stmt = $pdo->prepare("SELECT * FROM ticketmessages WHERE ticket_id = ? ORDER BY created_at ASC");
        $stmt->execute([$id]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Mark as read for the receiver
        if ($user['usertype'] == 0) {
            $pdo->prepare("UPDATE ticketmessages SET is_read = 1 WHERE ticket_id = ? AND sender_type != 'patient'")
                ->execute([$id]);
        } else if ($user['usertype'] == 1) {
            $pdo->prepare("UPDATE ticketmessages SET is_read = 1 WHERE ticket_id = ? AND sender_type != 'doctor'")
                ->execute([$id]);
        } else if ($user['usertype'] == 2) {
            $pdo->prepare("UPDATE ticketmessages SET is_read = 1 WHERE ticket_id = ? AND sender_type != 'clinic'")
                ->execute([$id]);
        } else if ($user['usertype'] == 3 || $user['usertype'] == 4) {
            $pdo->prepare("UPDATE ticketmessages SET is_read = 1 WHERE ticket_id = ? AND sender_type != 'admin'")
                ->execute([$id]);
        }

        // Also mark any unread ticket notifications for this user as read
        try {
            $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND type = 'ticket' AND is_read = 0")
                ->execute([$user['user_id']]);
        } catch (\Throwable $e) {
            // Ignore notification table errors
        }

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

        if (!$message) Response::error('يرجى كتابة رسالتك قبل الإرسال.', 422);

        $stmt = $pdo->prepare("SELECT * FROM tickets WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$ticket) Response::notFound('Ticket non trouvé');
        if ($ticket['status'] === 'CLOSED') Response::error('هذه التذكرة مغلقة. لا يمكن إضافة رد عليها بعد الإغلاق.', 422);

        $myId = null;
        $type = '';
        if ($user['usertype'] == 0) {
            $myId = self::getPatientId($user['user_id']);
            if ($ticket['patient_id'] !== $myId) Response::error('غير مسموح لك بالوصول إلى هذه التذكرة.', 403);
            $type = 'patient';
        } else if ($user['usertype'] == 1) {
            $myId = self::getDoctorId($user['user_id']);
            if ($ticket['doctor_id'] !== $myId) Response::error('غير مسموح لك بالوصول إلى هذه التذكرة.', 403);
            $type = 'doctor';
        } else if ($user['usertype'] == 2) {
            $myId = self::getClinicId($user['user_id']);
            if ($ticket['clinic_id'] !== $myId) Response::error('غير مسموح لك بالوصول إلى هذه التذكرة.', 403);
            $type = 'clinic';
        } else if ($user['usertype'] == 3 || $user['usertype'] == 4) {
            $myId = $user['user_id'];
            $type = 'admin';
        }

        $pdo->prepare("INSERT INTO ticketmessages (id, ticket_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?, ?)")
            ->execute([self::uuid(), $id, $type, $myId, $message]);

        // Update ticket status/updated_at
        $newStatus = ($type === 'patient') ? 'OPEN' : 'PENDING';
        $pdo->prepare("UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
            ->execute([$newStatus, $id]);

        // إرسال تنبيه للطرف الآخر
        try {
            require_once __DIR__ . '/../helpers/NotificationHelper.php';
            if ($type === 'patient') {
                // المريض رد -> تنبيه الطبيب أو العيادة
                if (!empty($ticket['doctor_id'])) {
                    $docStmt = $pdo->prepare("SELECT user_id FROM doctors WHERE id = ? LIMIT 1");
                    $docStmt->execute([$ticket['doctor_id']]);
                    $docUserId = $docStmt->fetchColumn();
                    if ($docUserId) {
                        NotificationHelper::notify(
                            $docUserId,
                            "رد جديد على رسالة",
                            "أرسل المريض رداً جديداً بخصوص: " . $ticket['subject'],
                            "ticket"
                        );
                    }
                } else if (!empty($ticket['clinic_id'])) {
                    $cliStmt = $pdo->prepare("SELECT user_id FROM clinics WHERE id = ? LIMIT 1");
                    $cliStmt->execute([$ticket['clinic_id']]);
                    $cliUserId = $cliStmt->fetchColumn();
                    if ($cliUserId) {
                        NotificationHelper::notify(
                            $cliUserId,
                            "رد جديد على رسالة",
                            "أرسل المريض رداً جديداً بخصوص: " . $ticket['subject'],
                            "ticket"
                        );
                    }
                }
            } else {
                // الطبيب أو العيادة أو الإدارة ردت -> تنبيه المريض
                $patStmt = $pdo->prepare("SELECT user_id FROM patients WHERE id = ? LIMIT 1");
                $patStmt->execute([$ticket['patient_id']]);
                $patUserId = $patStmt->fetchColumn();
                if ($patUserId) {
                    $senderName = ($type === 'doctor') ? 'الطبيب' : (($type === 'clinic') ? 'العيادة' : 'إدارة المنصة');
                    NotificationHelper::notify(
                        $patUserId,
                        "رد جديد من $senderName",
                        "تلقيت رداً جديداً بخصوص: " . $ticket['subject'],
                        "ticket"
                    );
                }
            }
        } catch (Throwable $e) {
            error_log("Failed to send ticket reply notification: " . $e->getMessage());
        }

        Response::success(null, 'تم إرسال ردك بنجاح.');
    }

    public static function close(string $id): void {
        $user = AuthMiddleware::authenticate();
        if ($user['usertype'] == 0) Response::error('إغلاق التذاكر متاح فقط للإدارة أو الطبيب أو العيادة.', 403);

        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM tickets WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$ticket) Response::notFound('لم يتم العثور على التذكرة المطلوبة.');

        $myId = null;
        if ($user['usertype'] == 1) {
            $myId = self::getDoctorId($user['user_id']);
            if ($ticket['doctor_id'] !== $myId) Response::error('غير مسموح لك بالوصول إلى هذه التذكرة.', 403);
        } else if ($user['usertype'] == 2) {
            $myId = self::getClinicId($user['user_id']);
            if ($ticket['clinic_id'] !== $myId) Response::error('غير مسموح لك بالوصول إلى هذه التذكرة.', 403);
        }
        // Admin & Support ($user['usertype'] == 3 || $user['usertype'] == 4) can close any ticket

        $pdo->prepare("UPDATE tickets SET status = 'CLOSED' WHERE id = ?")
            ->execute([$id]);

        Response::success(null, 'تم إغلاق التذكرة بنجاح.');
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
        require_once __DIR__ . '/../helpers/UUIDHelper.php';
        return UUIDHelper::generate();
    }
}
