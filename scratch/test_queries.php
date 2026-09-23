<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';
require_once __DIR__ . '/../backend/controllers/TicketController.php';
require_once __DIR__ . '/../backend/controllers/NotificationController.php';

$pdo = Database::getInstance();

$user = $pdo->query("SELECT * FROM users WHERE username = 'saint_germain_e24a93' LIMIT 1")->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    die("User not found\n");
}

echo "Testing user saint_germain_e24a93 (ID: {$user['id']}, Type: {$user['usertype']})\n";

// 1. Test notifications query
echo "\n--- Notifications Query ---\n";
try {
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user['id']]);
    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Notifications count: " . count($res) . "\n";
} catch (Exception $e) {
    echo "Notifications query ERROR: " . $e->getMessage() . "\n";
}

// 2. Test tickets query
echo "\n--- Tickets Query (Clinic) ---\n";
try {
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
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user['id']]);
    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Tickets count: " . count($res) . "\n";
} catch (Exception $e) {
    echo "Tickets query ERROR: " . $e->getMessage() . "\n";
}
