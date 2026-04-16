<?php
// register.php
include_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->username) && !empty($data->password) && !empty($data->fullname)) {
    
    $user_id = generate_uuid();
    $patient_id = generate_uuid();
    
    // ملاحظة: قاعدة البيانات الحالية تخزن الباسورد كنص عادي أو Base64 
    // ولكن للأمان يفضل استخدام password_hash
    $password_encoded = base64_encode($data->password); 

    try {
        $conn->beginTransaction();

        // 1. الإدخال في جدول المستخدمين
        $stmt1 = $conn->prepare("INSERT INTO Users (ID, Username, Password, UserType) VALUES (?, ?, ?, 0)");
        $stmt1->execute([$user_id, $data->username, $password_encoded]);

        // 2. الإدخال في جدول المرضى
        $stmt2 = $conn->prepare("INSERT INTO Patients (ID, FullName, Phone, Email, User_id) VALUES (?, ?, ?, ?, ?)");
        $stmt2->execute([$patient_id, $data->fullname, $data->phone, $data->email, $user_id]);

        $conn->commit();
        echo json_encode(["message" => "Account created successfully", "patient_id" => $patient_id]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["error" => "Registration failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["message" => "Incomplete data"]);
}
?>