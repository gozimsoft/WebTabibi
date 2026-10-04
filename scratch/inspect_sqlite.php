<?php
$dbPath = 'D:/Github/Utopya/Win32/Release/DBUtopia.db';

try {
    $pdo = new PDO("sqlite:" . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get all tables
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Successfully connected to SQLite database!\n";
    echo "Found " . count($tables) . " tables:\n\n";
    
    $stats = [];
    foreach ($tables as $table) {
        if (strpos($table, 'sqlite_') === 0) continue;
        try {
            $cStmt = $pdo->query("SELECT COUNT(*) FROM \"$table\"");
            $count = $cStmt->fetchColumn();
            $stats[$table] = $count;
        } catch (Exception $e) {
            $stats[$table] = "Error: " . $e->getMessage();
        }
    }
    
    foreach ($stats as $tbl => $cnt) {
        printf("%-35s : %s rows\n", $tbl, $cnt);
    }
    
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
