<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

class PublicController {
    public static function getStats(): void {
        try {
            $pdo = Database::getInstance();
            
            $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE usertype = 1");
            $doctors_count = $stmt->fetchColumn();
            
            $stmt2 = $pdo->query("SELECT COUNT(*) FROM users WHERE usertype = 2");
            $clinics_count = $stmt2->fetchColumn();
            
            $stmt3 = $pdo->query("SELECT COUNT(*) FROM users WHERE usertype = 0");
            $patients_count = $stmt3->fetchColumn();
        } catch (Exception $e) {
            error_log("Public stats error: " . $e->getMessage());
            // في حالة فشل الاتصال بقاعدة البيانات، نرجع أصفاراً
            $doctors_count = 0;
            $clinics_count = 0;
            $patients_count = 0;
        }
        
        Response::success([
            'doctors' => (int)$doctors_count,
            'clinics' => (int)$clinics_count,
            'patients' => (int)$patients_count
        ]);
    }

    public static function logVisit(): void {
        try {
            $pdo = Database::getInstance();
            
            // Create table if it doesn't exist
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS site_visits (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    ip_address VARCHAR(45) NOT NULL,
                    country VARCHAR(100) DEFAULT 'Unknown',
                    wilaya VARCHAR(100) DEFAULT 'Unknown',
                    visit_date DATE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_visit (ip_address, visit_date)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");

            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
            // Extract from headers if behind proxy
            if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
                $ip = $_SERVER['HTTP_CLIENT_IP'];
            } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
            }

            $country = isset($data['country']) ? trim($data['country']) : 'Unknown';
            $wilaya = isset($data['wilaya']) ? trim($data['wilaya']) : 'Unknown';
            $date = date('Y-m-d');

            $stmt = $pdo->prepare("INSERT IGNORE INTO site_visits (ip_address, country, wilaya, visit_date) VALUES (?, ?, ?, ?)");
            $stmt->execute([$ip, $country, $wilaya, $date]);

            Response::success(null, 'Visit logged');
        } catch (Exception $e) {
            // Silently fail if something goes wrong with logging
            Response::success(null, 'Visit log skipped');
        }
    }
}
