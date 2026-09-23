<?php
require_once __DIR__ . '/../backend/core/Database.php';
require_once __DIR__ . '/../backend/config/database.php';

$pdo = Database::getInstance();
$user = $pdo->query('SELECT u.id, u.username, c.id as clinic_id FROM users u JOIN clinics c ON c.user_id = u.id WHERE u.username = "saint_germain_e24a93"')->fetch(PDO::FETCH_ASSOC);

echo "User / Clinic:\n";
print_r($user);

// Let's get the profile as ClinicController::getProfile() does:
$stmt = $pdo->prepare("SELECT c.*, u.username FROM clinics c JOIN users u ON u.id = c.user_id WHERE c.user_id = ? LIMIT 1");
$stmt->execute([$user['id']]);
$clinic = $stmt->fetch(PDO::FETCH_ASSOC);
unset($clinic['password']);
if (!empty($clinic['logo'])) $clinic['logo'] = base64_encode($clinic['logo']);

echo "Keys in clinic profile returned to frontend:\n";
echo implode(', ', array_keys($clinic)) . "\n";
echo "Initial latitude: " . var_export($clinic['latitude'], true) . "\n";
echo "Initial longitude: " . var_export($clinic['longitude'], true) . "\n";

// Now, what if the frontend sends back cleanForm with latitude = 36.7538 and longitude = 3.0588:
$cleanForm = $clinic;
$cleanForm['latitude'] = 36.7538;
$cleanForm['longitude'] = 3.0588;

// Simulate ClinicController::updateProfile:
$data = $cleanForm;

// 1. users table
if (!empty($data['username'])) {
    $check = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
    $check->execute([$data['username'], $user['id']]);
    if ($check->fetchColumn()) {
        echo "ERROR: Username duplicate\n";
    }
}

// 2. clinics table
require_once __DIR__ . '/../backend/helpers/UserValidationHelper.php';
if (!empty($data['phone'])) {
    $newPhone = trim($data['phone']);
    if (UserValidationHelper::isPhoneDuplicate($newPhone, $clinic['id'])) {
        echo "ERROR: Phone duplicate for $newPhone!\n";
    }
}
if (!empty($data['email'])) {
    $newEmail = trim($data['email']);
    if (UserValidationHelper::isEmailDuplicate($newEmail, $clinic['id'])) {
        echo "ERROR: Email duplicate for $newEmail!\n";
    }
}

$allowed = ['clinicname', 'email', 'phone', 'address', 'notes', 'fax', 'website', 'typeclinic', 'cliniccoordinates', 'latitude', 'longitude', 'services', 'postcode', 'aboutclinic', 'hospitalization', 'hiderating', 'emergency', 'ambulances'];
$fields = [];
$values = [];
foreach ($allowed as $field) {
    if (array_key_exists($field, $data)) {
        $fields[] = "`$field` = ?";
        $values[] = $data[$field];
    }
}
if (!empty($data['phone'])) {
    $fields[] = "`phonevalidation` = 1";
}
if (!empty($fields)) {
    $values[] = $clinic['id'];
    $sql = "UPDATE clinics SET " . implode(', ', $fields) . " WHERE id = ?";
    echo "SQL: " . substr($sql, 0, 80) . "...\n";
    $stmt = $pdo->prepare($sql);
    try {
        $res = $stmt->execute($values);
        echo "Update result: " . ($res ? "SUCCESS" : "FAIL") . "\n";
    } catch (Exception $e) {
        echo "Update EXCEPTION: " . $e->getMessage() . "\n";
    }
}

// Check after update:
$stmt = $pdo->prepare("SELECT latitude, longitude FROM clinics WHERE id = ?");
$stmt->execute([$clinic['id']]);
$after = $stmt->fetch(PDO::FETCH_ASSOC);
echo "After update:\n";
print_r($after);
