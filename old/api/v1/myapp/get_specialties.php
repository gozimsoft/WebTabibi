<?php
// get_specialties.php
include_once 'db.php';

$query = "SELECT * FROM Specialties ORDER BY NameAr ASC";
$stmt = $conn->prepare($query);
$stmt->execute();

$specialties = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($specialties);
?>