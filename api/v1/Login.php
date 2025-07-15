<?php
header("Content-Type: application/json");
require_once("config.php");

$data = json_decode(file_get_contents("php://input"), true);

$username = $data["username"] ?? "";
$password = $data["password"] ?? "";

$sql = "
    SELECT 
        Users.ID, 
        UserType, 
        Doctors.ID AS Doctor_id, 
        Patients.ID AS Patient_id
    FROM Users
    LEFT JOIN Patients ON Patients.User_id = Users.ID
    LEFT JOIN Doctors ON Doctors.User_id = Users.ID
    WHERE 
        (Users.Username = :Username 
         OR Patients.email = :Username
         OR Patients.phone = :Username
         OR Doctors.email = :Username
         OR Doctors.phone = :Username)
      AND Users.Password = :Password
";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ":Username" => $username,
    ":Password" => $password
]);

if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    // generate random token
    $token = bin2hex(random_bytes(32)); // 64 characters

    // store token in sessions table
    $insert = $pdo->prepare("INSERT INTO sessions (user_id, token) VALUES (:user_id, :token)");
    $insert->execute([
        ":user_id" => $row["ID"],
        ":token" => $token
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Login successful",
        "token" => $token,
        "data" => $row
    ]);
} else {
    echo json_encode([
        "status" => "fail",
        "message" => "Invalid username or password"
    ]);
}
