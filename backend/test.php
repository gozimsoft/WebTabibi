<?php
require 'core/Database.php';
$pdo = Database::getInstance();
$patients = $pdo->query("SHOW COLUMNS FROM patients")->fetchAll(PDO::FETCH_ASSOC);
$doctors = $pdo->query("SHOW COLUMNS FROM doctors")->fetchAll(PDO::FETCH_ASSOC);
$doctorreg = $pdo->query("SHOW COLUMNS FROM doctorregistrations")->fetchAll(PDO::FETCH_ASSOC);

echo "Patients columns:\n";
foreach($patients as $c) echo $c['Field']."\n";

echo "\nDoctors columns:\n";
foreach($doctors as $c) echo $c['Field']."\n";

echo "\nDoctorRegistrations columns:\n";
foreach($doctorreg as $c) echo $c['Field']."\n";
