<?php
$sqlitePath = 'D:/Github/Utopya/Win32/Release/DBUtopia.db';
$targetDir = 'D:/Github/Utopia_react/database';
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$pdo = new PDO("sqlite:" . $sqlitePath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$tablesStmt = $pdo->query("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
$tables = $tablesStmt->fetchAll(PDO::FETCH_ASSOC);

function mapTypeToMariaDB($type) {
    $t = strtoupper(trim($type));
    if (empty($t)) return "VARCHAR(255)";
    
    // Check CHAR(n)
    if (preg_match('/^CHAR\((\d+)\)$/i', $t, $m)) {
        $len = intval($m[1]);
        if ($len > 255) {
            return ($len > 4000) ? "TEXT" : "VARCHAR($len)";
        }
        return "VARCHAR($len)";
    }
    
    if (preg_match('/^VARCHAR\((\d+)\)$/i', $t, $m)) {
        $len = intval($m[1]);
        return ($len > 4000) ? "TEXT" : "VARCHAR($len)";
    }
    
    if (strpos($t, 'INT') !== false) {
        if (strpos($t, 'BIGINT') !== false) return "BIGINT";
        if (strpos($t, 'TINYINT') !== false) return "TINYINT";
        return "INT";
    }
    if (strpos($t, 'TEXT') !== false || strpos($t, 'CLOB') !== false) return "LONGTEXT";
    if (strpos($t, 'BLOB') !== false || strpos($t, 'IMAGE') !== false) return "LONGBLOB";
    if (strpos($t, 'FLOAT') !== false || strpos($t, 'DOUBLE') !== false || strpos($t, 'REAL') !== false) return "DOUBLE";
    if (strpos($t, 'DECIMAL') !== false || strpos($t, 'NUMERIC') !== false || strpos($t, 'MONEY') !== false) return "DECIMAL(18, 4)";
    if (strpos($t, 'BOOL') !== false) return "TINYINT(1)";
    if (strpos($t, 'DATE') !== false && strpos($t, 'TIME') === false) return "DATE";
    if (strpos($t, 'TIME') !== false) return "DATETIME";
    return "VARCHAR(255)";
}

$schemaInfo = [];
$mariaDBSQL = "-- =====================================================\n";
$mariaDBSQL .= "-- Utopia ERP - MariaDB Schema & Initial Data\n";
$mariaDBSQL .= "-- Converted from DBUtopia.db (SQLite3)\n";
$mariaDBSQL .= "-- Date: " . date('Y-m-d H:i:s') . "\n";
$mariaDBSQL .= "-- =====================================================\n\n";
$mariaDBSQL .= "CREATE DATABASE IF NOT EXISTS `utopia_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n";
$mariaDBSQL .= "USE `utopia_db`;\n\n";
$mariaDBSQL .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";

foreach ($tables as $t) {
    $tableName = $t['name'];
    $colsStmt = $pdo->query("PRAGMA table_info(\"$tableName\")");
    $columns = $colsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $schemaInfo[$tableName] = [
        'columns' => $columns,
        'sqlite_create' => $t['sql']
    ];
    
    $colDefs = [];
    $pks = [];
    foreach ($columns as $c) {
        $cName = $c['name'];
        $cType = mapTypeToMariaDB($c['type']);
        $notNull = $c['notnull'] ? "NOT NULL" : "NULL";
        $default = $c['dflt_value'] !== null ? "DEFAULT " . $c['dflt_value'] : "";
        if ($c['pk'] == 1) {
            $pks[] = "`$cName`";
        }
        $colDefs[] = "  `$cName` $cType $notNull $default";
    }
    
    if (!empty($pks)) {
        $colDefs[] = "  PRIMARY KEY (" . implode(", ", $pks) . ")";
    }
    
    $mariaDBSQL .= "-- Table: $tableName\n";
    $mariaDBSQL .= "DROP TABLE IF EXISTS `$tableName`;\n";
    $mariaDBSQL .= "CREATE TABLE `$tableName` (\n" . implode(",\n", $colDefs) . "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n";
    
    $dataStmt = $pdo->query("SELECT * FROM \"$tableName\"");
    $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
    if (!empty($rows)) {
        $mariaDBSQL .= "-- Data for $tableName (" . count($rows) . " rows)\n";
        foreach ($rows as $row) {
            $colNames = array_map(function($k) { return "`$k`"; }, array_keys($row));
            $escapedVals = array_map(function($v) {
                if ($v === null) return "NULL";
                return "'" . addslashes($v) . "'";
            }, array_values($row));
            $mariaDBSQL .= "INSERT INTO `$tableName` (" . implode(", ", $colNames) . ") VALUES (" . implode(", ", $escapedVals) . ");\n";
        }
        $mariaDBSQL .= "\n";
    }
}

$mariaDBSQL .= "SET FOREIGN_KEY_CHECKS = 1;\n";

file_put_contents("$targetDir/utopia_mariadb.sql", $mariaDBSQL);
echo "Regenerated $targetDir/utopia_mariadb.sql (" . round(strlen($mariaDBSQL)/1024, 2) . " KB)\n";

file_put_contents("$targetDir/schema_analysis.json", json_encode($schemaInfo, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Regenerated $targetDir/schema_analysis.json\n";
