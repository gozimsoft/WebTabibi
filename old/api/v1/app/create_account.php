<?php

header("Content-Type: application/json");

require_once("../config.php");
require_once("../auth.php");
require_once("../controllers.php");
 
$data = json_decode(file_get_contents("php://input"), true);

$FullName = $data["FullName"] ?? '';
$UserName = $data["UserName"] ?? '';
$Password = $data["Password"] ?? '';
$Phone    = $data["Phone"] ?? '';
$Email    = $data["Email"] ?? '';
$Address  = $data["Address"] ?? '';

 

// تحقق من البيانات
if (empty($FullName) || empty($UserName) || empty($Password)) {
    echo json_encode([
        "status" => "fail",
        "message" => "Missing required fields"
    ]);
    exit;
}


// التحقق إذا كان المريض موجود مسبقًا
$checkStmt = $pdo->prepare("
    SELECT p.ID 
    FROM Patients p
    INNER JOIN Users u ON p.User_id = u.ID
    WHERE u.Username = :UserName
       OR p.Phone = :Phone
       OR p.Email = :Email
");
$checkStmt->execute([
    ":UserName" => $UserName,
    ":Phone"    => $Phone,
    ":Email"    => $Email
]);

if ($checkStmt->fetch()) {
    echo json_encode([
        "status" => "fail",
        "message" => "Patient already exists"
    ]);
    exit;
}
 

$User_id =  generateUUIDv4();

// إضافة الحساب للمستخدم
$stmt = $pdo->prepare("INSERT INTO Users
(ID, Username, Password, UserType) VALUES
(:ID, :UserName, :Password, :UserType)
");


try
 {
    $success = $stmt->execute([
        ":ID"       => $User_id,
        ":UserName" => $UserName,
        ":Password" => xorEncrypt($Password),
        ":UserType" => 0
    ]);
       
           if ($success) {
               
               
               
                            $stmt = $pdo->prepare("INSERT INTO Patients
                            (ID, FullName, Phone, Email, Address, User_id) VALUES
                            (:ID, :FullName, :Phone, :Email, :Address, :User_id)
                            ");
                        
                            $success = $stmt->execute([
                                ":ID"       => generateUUIDv4(),
                                ":FullName" => $FullName,
                                ":Phone"    => $Phone,
                                ":Email"    => $Email,
                                ":Address"  => $Address,
                                ":User_id"  => $User_id
                            ]);
                        
                            if ($success) {
                                echo json_encode([
                                    "status"  => "success",
                                    "message" => "Account created"
                                ]);
                            } else {
                                echo json_encode([
                                    "status"  => "fail",
                                    "message" => "Failed to create account"
                                ]);
                            }
                       
                        } else {
                            echo json_encode([
                                "status"  => "fail",
                                "message" => "Failed to create account"
                            ]);
               
                       }
 }
catch (Exception $e) 
{     
    echo json_encode([
            "status"  => "fail",
             "message" => $e->getMessage()
        ]);
}



?>
