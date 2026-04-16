<?php
require_once("../api/v1/controllers.php");
 

if( SendMailContact(  $_POST['email'] , $_POST['name'] ,'Contcat', $_POST['message']) ) {
  echo "OK"; // <-- مهم جدا!
} else {
  echo "Erreur lors de l'envoi.";
}

?>
