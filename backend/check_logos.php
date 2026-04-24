<?php
require_once __DIR__ . '/core/Database.php';
$pdo = Database::getInstance();
try {
    $stmt = $pdo->query('SELECT ID, ClinicName, LENGTH(Logo) as LogoSize FROM Clinics WHERE Logo IS NOT NULL');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "CLINICS WITH LOGOS:\n";
    foreach ($rows as $r) {
        echo "- " . $r['ClinicName'] . " (ID: " . $r['ID'] . ") Logo Size: " . $r['LogoSize'] . " bytes\n";
    }
    
    // Check for duplicate logos (exact same binary content)
    $stmt = $pdo->query('SELECT Logo, COUNT(*) as count FROM Clinics WHERE Logo IS NOT NULL GROUP BY Logo HAVING count > 1');
    $dupes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($dupes) {
        echo "\nDUPLICATE LOGOS FOUND:\n";
        foreach ($dupes as $d) {
            echo "- " . $d['count'] . " clinics share the same logo data (Size: " . strlen($d['Logo']) . " bytes)\n";
        }
    } else {
        echo "\nNo duplicate logos found in the database.\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
