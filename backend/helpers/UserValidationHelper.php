<?php
// ============================================================
// helpers/UserValidationHelper.php
// ============================================================
require_once __DIR__ . '/../core/Database.php';

class UserValidationHelper {

    /**
     * Checks if an email is already used in ANY table (patients, doctors, clinics)
     * Returns true if duplicate found, false otherwise.
     */
    public static function isEmailDuplicate(string $email, ?string $excludeId = null): bool {
        $pdo = Database::getInstance();
        $email = strtolower(trim($email));

        $tables = ['patients', 'doctors', 'clinics'];
        foreach ($tables as $table) {
            $sql = "SELECT COUNT(*) FROM `$table` WHERE LOWER(email) = ?";
            $params = [$email];
            if ($excludeId) {
                $sql .= " AND id != ?";
                $params[] = $excludeId;
            }
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            if ($stmt->fetchColumn() > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * التحقق من عدم تكرار رقم الهاتف عبر جميع جداول النظام (المرضى، الأطباء، العيادات، وطلبات التسجيل)
     * Checks if a phone number is already used in ANY table (patients, doctors, clinics, doctorregistrations, clinicregistrations)
     * Cleans phone number from spaces, dashes, slashes, and country codes before checking.
     */
    public static function isPhoneDuplicate(string $phone, ?string $excludeId = null): bool {
        $pdo = Database::getInstance();
        $cleanDigits = preg_replace('/[^\d]/', '', $phone); // keep only digits

        if (empty($cleanDigits)) {
            return false;
        }

        // إذا كان الرقم يبدأ بـ 213 (رمز الجزائر) أو 0، توحيد الصيغة للفحص
        $localDigits = preg_replace('/^213/', '0', $cleanDigits);
        $intDigits = ltrim($cleanDigits, '0');

        $tables = [
            'patients' => 'id',
            'doctors' => 'id',
            'clinics' => 'id',
            'doctorregistrations' => 'id',
            'clinicregistrations' => 'id',
        ];

        foreach ($tables as $table => $idCol) {
            $sql = "SELECT COUNT(*) FROM `$table` WHERE 
                    (
                        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', ''), '+', ''), '/', '') = ?
                        OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', ''), '+', ''), '/', '') = ?
                        OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', ''), '+', ''), '/', '') = ?
                    )";
            $params = [$cleanDigits, $localDigits, $intDigits];

            if ($table === 'doctorregistrations' || $table === 'clinicregistrations') {
                $sql .= " AND status != 'REJECTED'";
            }

            if ($excludeId) {
                $sql .= " AND `$idCol` != ?";
                $params[] = $excludeId;
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            if ($stmt->fetchColumn() > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Finds a user across all roles by email
     */
    public static function findUserByEmail(string $email): ?array {
        $pdo = Database::getInstance();
        $email = strtolower(trim($email));
        
        $stmt = $pdo->prepare("SELECT user_id, fullname as name, emailvalidation FROM patients WHERE LOWER(email) = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($row = $stmt->fetch()) {
            return ['user_id' => $row['user_id'], 'name' => $row['name'], 'email' => $email, 'type' => 'patient', 'emailvalidation' => $row['emailvalidation'] ?? 1];
        }
        
        $stmt = $pdo->prepare("SELECT user_id, fullname as name, emailvalidation FROM doctors WHERE LOWER(email) = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($row = $stmt->fetch()) {
            return ['user_id' => $row['user_id'], 'name' => $row['name'], 'email' => $email, 'type' => 'doctor', 'emailvalidation' => $row['emailvalidation'] ?? 1];
        }
        
        $stmt = $pdo->prepare("SELECT user_id, clinicname as name, emailvalidation FROM clinics WHERE LOWER(email) = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($row = $stmt->fetch()) {
            return ['user_id' => $row['user_id'], 'name' => $row['name'], 'email' => $email, 'type' => 'clinic', 'emailvalidation' => $row['emailvalidation'] ?? 1];
        }
        
        return null;
    }
}
