<?php
header("Content-Type: application/json");

require_once("../config.php");
require_once("../auth.php");
require_once("../controllers.php");


$data = json_decode(file_get_contents("php://input"), true);
$filter = $data['filter'] ?? '';
$filter = "%{$filter}%"; // لإضافة البحث الجزئي

 
$stmt = $pdo->prepare("
 SELECT * from (    SELECT    Clinics.ID, 
      0 AS TypeUser,    ClinicName AS Name,    Address,  
     ActivitySector AS Activity,    Clinics.HideRating,  
     COUNT(ClinicsRatings.ID) AS CountRating,  
     (SUM(ClinicsRatings.Rating) / COUNT(ClinicsRatings.ID)) AS Rating  
     FROM Clinics  
     LEFT JOIN ClinicsRatings ON ClinicsRatings.Clinic_id = Clinics.ID  
     Where ClinicName Like :filter  or ActivitySector Like :filter  
     GROUP BY Clinics.ID, ClinicName, Address, ActivitySector, Clinics.HideRating 
      UNION ALL    SELECT    Doctors.ID,    1 AS TypeUser,  
     FullName AS Name,    Doctors.Address,  
     Specialties.NameFr AS Activity,    Doctors.HideRating,  
     COUNT(DoctorsRatings.ID) AS CountRating,   
     (SUM(DoctorsRatings.Rating) / COUNT(DoctorsRatings.ID)) AS Rating  
     FROM Doctors  
     LEFT JOIN Specialties ON Specialties.ID = Doctors.Specialtie_id  
     LEFT JOIN DoctorsRatings ON DoctorsRatings.Doctor_id = Doctors.ID  
     Where FullName Like :filter   or NameFr Like :filter   
     GROUP BY Doctors.ID, FullName, Doctors.Address, Specialties.NameFr, Doctors.HideRating 
      )    AS AllResults LIMIT 20 ;
      ");
$stmt->execute([':filter' => $filter]);   
$dairas = $stmt->fetchAll(PDO::FETCH_ASSOC);

// إرسال الرد
echo json_encode([
    'status' => 'success',
    'data' => $dairas
]);
