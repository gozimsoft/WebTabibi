<?php
require_once("../api/v1/controllers.php");
 
 
$name = $_POST['name']  ;
$email = $_POST['email']  ;
$phone = $_POST['phone']  ;
$date = $_POST['date']  ;
$department = $_POST['department']  ;
$doctor = $_POST['doctor']  ;
$message = $_POST['message']  ;

 $body = ' Doctor : ' .$doctor. "<br>".
          ' Phone : ' .$phone. "<br>".
          ' Department : ' .$department. "<br>".
          ' Date : ' .$date. "<br>".
          ' Contect : ' .$message ;
          
if( SendMailContact( $email ,$name,'Appointment', $body ) ) {
  echo "OK"; // <-- مهم جدا!
} else {
  echo "Erreur lors de l'envoi.";
}

 
 
?>
