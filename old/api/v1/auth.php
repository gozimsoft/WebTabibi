<?php
require_once("config.php");

function validateToken($token) {
    global $pdo;
    $stmt = $pdo->prepare(" 
    SELECT  Users.ID as user_id , Doctors.ID as doctor_id , Patients.ID as patient_id
    from Users  
               inner join sessions on sessions.user_id =  Users.id    
               left join Doctors on Doctors.User_id = Users.id
               left join Patients on Patients.User_id = Users.id
    WHERE token = :token");
    $stmt->execute([':token' => $token]);    
    return $stmt->fetch(PDO::FETCH_ASSOC); // يرجع بيانات الجلسة أو false
}
