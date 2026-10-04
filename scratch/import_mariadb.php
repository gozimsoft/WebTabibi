<?php
$sqlFile = 'D:/Github/Utopia_react/database/utopia_mariadb.sql';

try {
    $mysqli = new mysqli("127.0.0.1", "root", "");
    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error . "\n");
    }
    
    echo "Connected to MariaDB.\nExecuting SQL import...\n";
    
    // Read and execute multi query
    $sql = file_get_contents($sqlFile);
    if ($mysqli->multi_query($sql)) {
        do {
            /* store first result set */
            if ($result = $mysqli->store_result()) {
                $result->free();
            }
        } while ($mysqli->more_results() && $mysqli->next_result());
    }
    
    if ($mysqli->error) {
        echo "MariaDB Warning/Error during import: " . $mysqli->error . "\n";
    } else {
        echo "Successfully imported all 61 tables and data into MariaDB database `utopia_db`!\n";
    }
    
    // Verify tables count in utopia_db
    $mysqli->select_db("utopia_db");
    $res = $mysqli->query("SHOW TABLES");
    echo "Tables in utopia_db: " . $res->num_rows . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
