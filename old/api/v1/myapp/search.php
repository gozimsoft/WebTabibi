<?php
// search.php
include_once 'db.php';

$name = isset($_GET['name']) ? $_GET['name'] : "";
$specialty_id = isset($_GET['specialty_id']) ? $_GET['specialtie_id'] : "";

$query = "SELECT d.ID, d.FullName, d.Address, d.Phone, s.NameAr as SpecialtyName 
          FROM Doctors d
          JOIN Specialties s ON d.Specialtie_id = s.ID
          WHERE d.FullName LIKE ? ";

if(!empty($specialty_id)) {
    $query .= " AND d.Specialtie_id = '$specialty_id'";
}

$stmt = $conn->prepare($query);
$stmt->execute(["%$name%"]);

$doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($doctors);
?>