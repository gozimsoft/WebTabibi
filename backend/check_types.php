<?php
require_once __DIR__ . '/core/Database.php';
$pdo = Database::getInstance();

function describe($table) {
    global $pdo;
    try {
        $stmt = $pdo->query("DESCRIBE $table");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $row) {
            if ($row['Field'] === 'ID') {
                echo "TABLE: $table, ID Type: " . $row['Type'] . "\n";
                break;
            }
        }
    } catch (Exception $e) {
        echo "Error describing $table: " . $e->getMessage() . "\n";
    }
}

describe('Patients');
describe('Doctors');
describe('Clinics');
