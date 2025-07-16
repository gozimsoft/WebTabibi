<?php
require_once("config.php");

function xorEncrypt($text)
{
    $key = 5; // ثابت
    $output = '';
    for ($i = 0; $i < strlen($text); $i++) {
        $output .= chr(ord($text[$i]) ^ $key);
    }
    return base64_encode($output);
}

function xorDecrypt($encoded)
{
    $key = 5;
    $text = base64_decode($encoded);
    $output = '';
    for ($i = 0; $i < strlen($text); $i++) {
        $output .= chr(ord($text[$i]) ^ $key);
    }
    return $output;
}


function CheckLogin(string $username, string $password): string
{
    global $pdo; // تأكد من وجود $pdo في config.php

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
        ":Password" => xorEncrypt($password)
    ]);

    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // توليد التوكن
        $token = bin2hex(random_bytes(32)); // 64 حرفًا
        $usertype = $row['UserType'];
        // حفظ التوكن
        $insert = $pdo->prepare("INSERT INTO sessions (user_id, token) VALUES (:user_id, :token)");
        $insert->execute([
            ":user_id" => $row["ID"],
            ":token" => $token
        ]);

        return json_encode([
            "status" => "success",
            "message" => "Login successful",
            "token" => $token,                           
            "data" => $row
        ]);
    } else {
        return json_encode([
            "status" => "fail",
            "message" => "Invalid username or password"
        ]);
    }
}





?>