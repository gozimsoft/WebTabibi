<?php
try {
    $mysqli = @new mysqli("127.0.0.1", "root", "");
    if ($mysqli->connect_error) {
        echo "MariaDB/MySQL connection error: " . $mysqli->connect_error . "\n";
    } else {
        echo "MariaDB/MySQL connected successfully!\n";
        echo "Server version: " . $mysqli->server_info . "\n";
        
        $res = $mysqli->query("SHOW DATABASES");
        echo "Databases:\n";
        while ($row = $res->fetch_array()) {
            echo " - " . $row[0] . "\n";
        }
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
