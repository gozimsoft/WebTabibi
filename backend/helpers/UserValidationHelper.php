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
     * Checks if a phone number is already used in ANY table
     * Cleans phone number from spaces and symbols before checking.
     */
    public static function isPhoneDuplicate(string $phone, ?string $excludeId = null): bool {
        $pdo = Database::getInstance();
        $cleanPhone = preg_replace('/[^\d\+]/', '', $phone); // keep only digits and +

        if (empty($cleanPhone)) {
            return false;
        }

        $tables = ['patients', 'doctors', 'clinics'];
        foreach ($tables as $table) {
            $sql = "SELECT COUNT(*) FROM `$table` WHERE 
                    REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', ''), '+', '') = ?";
            $params = [str_replace('+', '', $cleanPhone)];
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
