<?php
$mysqli = new mysqli("127.0.0.1", "root", "", "utopia_db");
$res = $mysqli->query("SELECT * FROM Users");
echo "Users table:\n";
while ($row = $res->fetch_assoc()) {
    print_r($row);
}

$res = $mysqli->query("SELECT * FROM USERS_ROLES");
echo "\nUSERS_ROLES table:\n";
while ($row = $res->fetch_assoc()) {
    print_r($row);
}

$res = $mysqli->query("SELECT DISTINCT Vendeur FROM InvoicesVentes");
echo "\nVendeurs in InvoicesVentes:\n";
while ($row = $res->fetch_assoc()) {
    print_r($row);
}
