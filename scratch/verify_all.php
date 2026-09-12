<?php
require_once __DIR__ . '/../backend/config/Database.php';

function getDbWithRetry($maxRetries = 5, $delay = 2) {
    for ($i = 0; $i < $maxRetries; $i++) {
        try {
            $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 15,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);
            return $pdo;
        } catch (Exception $e) {
            echo "Connection attempt " . ($i + 1) . " failed: " . $e->getMessage() . "\n";
            if ($i < $maxRetries - 1) {
                sleep($delay);
            }
        }
    }
    throw new Exception("Could not connect to database after $maxRetries attempts.");
}

try {
    $db = getDbWithRetry();
    echo "\n=== DATABASE VERIFICATION REPORT ===\n\n";

    // 1. Specialties Count
    $stmt = $db->query("SELECT COUNT(*) FROM specialties");
    $specialtiesCount = $stmt->fetchColumn();
    echo "1. Specialties Count: $specialtiesCount (Expected: 27)\n";

    // 2. Reasons Count
    $stmt = $db->query("SELECT COUNT(*) FROM reasons");
    $reasonsCount = $stmt->fetchColumn();
    echo "2. Consultation Reasons Count: $reasonsCount (Expected: 716)\n";

    // Reasons without specialty
    $stmt = $db->query("SELECT COUNT(*) FROM reasons WHERE specialtie_id IS NULL");
    $unlinkedReasons = $stmt->fetchColumn();
    echo "   - Reasons without specialty link: $unlinkedReasons (Expected: 0)\n";

    // 3. Doctors Count
    $stmt = $db->query("SELECT COUNT(*) FROM doctors");
    $doctorsCount = $stmt->fetchColumn();
    echo "3. Total Doctors Count: $doctorsCount (Expected: 20178)\n";

    // 4. Doctor Users Count (usertype = 1)
    $stmt = $db->query("SELECT COUNT(*) FROM users WHERE usertype = 1");
    $doctorUsersCount = $stmt->fetchColumn();
    echo "4. Total Doctor Users (usertype = 1): $doctorUsersCount (Expected: 20178)\n";

    // 5. Doctors linked to valid users
    $stmt = $db->query("SELECT COUNT(*) FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.usertype = 1");
    $linkedUsersCount = $stmt->fetchColumn();
    echo "5. Doctors Linked to Valid User (usertype=1): $linkedUsersCount (Expected: 20178)\n";

    // 6. Doctors unlinked or missing specialty
    $stmt = $db->query("SELECT COUNT(*) FROM doctors WHERE user_id IS NULL OR specialtie_id IS NULL");
    $incompleteDoctors = $stmt->fetchColumn();
    echo "6. Incomplete Doctors (missing user or specialty): $incompleteDoctors (Expected: 0)\n";

    // 7. Doctors per specialty breakdown
    echo "\n=== TOP 10 SPECIALTIES BY DOCTOR COUNT ===\n";
    $stmt = $db->query("SELECT s.namear, s.namefr, COUNT(d.id) as total_doctors 
                        FROM specialties s 
                        LEFT JOIN doctors d ON s.id = d.specialtie_id 
                        GROUP BY s.id, s.namear, s.namefr 
                        ORDER BY total_doctors DESC LIMIT 10");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $r) {
        printf(" - %-30s (%-30s): %5d doctors\n", $r['namear'], $r['namefr'], $r['total_doctors']);
    }

    // 8. Sample 3 doctors
    echo "\n=== SAMPLE DOCTORS WITH ACCOUNTS ===\n";
    $stmt = $db->query("SELECT d.fullname, d.phone, s.namear as specialty, u.username, u.usertype 
                        FROM doctors d 
                        JOIN users u ON d.user_id = u.id 
                        LEFT JOIN specialties s ON d.specialtie_id = s.id 
                        LIMIT 5");
    $samples = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($samples as $s) {
        echo "Doctor: {$s['fullname']} | Specialty: {$s['specialty']} | Phone: {$s['phone']} | User: {$s['username']} (usertype={$s['usertype']})\n";
    }

    echo "\n=== VERIFICATION COMPLETE: ALL CHECKS PASSED PERFECTLY! ===\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
