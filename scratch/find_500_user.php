<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

$users = $pdo->query("SELECT id, username, usertype FROM users")->fetchAll(PDO::FETCH_ASSOC);

foreach ($users as $user) {
    $userRow = ['user_id' => $user['id'], 'usertype' => $user['usertype'], 'username' => $user['username']];
    
    // Run the exact logic of TicketController::list
    $myId = null;
    $sql = "";
    $params = [];

    if ($userRow['usertype'] == 0) {
        $stmtPat = $pdo->prepare("SELECT id FROM patients WHERE user_id = ? LIMIT 1");
        $stmtPat->execute([$userRow['user_id']]);
        $myId = $stmtPat->fetchColumn() ?: '';
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
    } else if ($userRow['usertype'] == 1) {
        $stmtDoc = $pdo->prepare("SELECT id FROM doctors WHERE user_id = ? LIMIT 1");
        $stmtDoc->execute([$userRow['user_id']]);
        $myId = $stmtDoc->fetchColumn() ?: '';
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
    } else if ($userRow['usertype'] == 2) {
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
        $params = [$userRow['user_id']];
    } else if ($userRow['usertype'] == 3 || $userRow['usertype'] == 4) {
        $sql = "SELECT t.id, t.patient_id, t.doctor_id, t.clinic_id, t.subject, t.status, t.created_at, t.updated_at,
                    p.fullname as patientname, 
                    p.phone as patient_phone, 
                    p.email as patient_email, 
                    d.fullname as doctorname, 
                    d.phone as doctor_phone, 
                    c.clinicname, 
                    NULL as last_message,
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
        if (empty($sql)) {
            echo "[500 TRIGGER] User {$user['username']} has invalid usertype: '{$user['usertype']}' (ID: {$user['id']})\n";
            continue;
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (\Throwable $e) {
        echo "[500 EXCEPTION] User {$user['username']} (type: {$user['usertype']}): " . $e->getMessage() . "\n";
    }
}
echo "All users checked.\n";
