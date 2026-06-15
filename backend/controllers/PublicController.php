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
}
