<?php
require_once __DIR__ . '/../backend/core/Database.php';
$pdo = Database::getInstance();

echo "Total doctors: " . $pdo->query("SELECT COUNT(*) FROM doctors")->fetchColumn() . "\n";
echo "Doctors with baladiya_id: " . $pdo->query("SELECT COUNT(*) FROM doctors WHERE baladiya_id IS NOT NULL")->fetchColumn() . "\n";
echo "Doctors referencing invalid baladiya_id: " . $pdo->query("SELECT COUNT(*) FROM doctors d LEFT JOIN baladiyas b ON b.id = d.baladiya_id WHERE d.baladiya_id IS NOT NULL AND b.id IS NULL")->fetchColumn() . "\n";
echo "Patients referencing invalid baladiya_id: " . $pdo->query("SELECT COUNT(*) FROM patients p LEFT JOIN baladiyas b ON b.id = p.baladiya_id WHERE p.baladiya_id IS NOT NULL AND b.id IS NULL")->fetchColumn() . "\n";
