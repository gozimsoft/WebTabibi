<?php
// login.php
include_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->username) && !empty($data->password)) {
    $password_encoded = base64_encode($data->password);

    $query = "SELECT u.ID as user_id, p.ID as patient_id, p.FullName 
              FROM Users u 
              JOIN Patients p ON u.ID = p.User_id 
              WHERE u.Username = ? AND u.Password = ? LIMIT 1";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->username, $password_encoded]);

    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $row]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid Login"]);
    }
}
?>