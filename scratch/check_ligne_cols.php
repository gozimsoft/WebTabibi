<?php
$mysqli = new mysqli('127.0.0.1', 'root', '', 'utopia_db');
$res = $mysqli->query('DESCRIBE Ligne_Ventes');
while ($row = $res->fetch_assoc()) {
    echo $row['Field'] . ' (' . $row['Type'] . ")\n";
}
