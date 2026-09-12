import json
import re

# Import mappings from define_reasons_mappings
from define_reasons_mappings import translations, section_to_specialty_ar
from parse_reasons import sections

# Load specialties IDs from DB via a PHP helper or direct script
# Let's generate a complete PHP script to alter table and insert all reasons!

php_script = """<?php
require_once __DIR__ . '/../backend/core/Database.php';

$pdo = Database::getInstance();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "1. Altering reasons table schema...\\n";
try {
    $pdo->exec("ALTER TABLE `reasons` 
                MODIFY COLUMN `name` VARCHAR(255) NOT NULL");
} catch (Exception $e) {}

try {
    $pdo->exec("ALTER TABLE `reasons` 
                ADD COLUMN `namear` VARCHAR(255) NULL AFTER `name`,
                ADD COLUMN `namefr` VARCHAR(255) NULL AFTER `namear`");
} catch (Exception $e) {}

// Load specialties mapping
$stmt = $pdo->query("SELECT id, namear, namefr FROM specialties");
$spec_map = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $spec_map[trim($row['namear'])] = $row['id'];
}

echo "Loaded " . count($spec_map) . " specialties from DB.\\n";

// Clear existing reasons before inserting full reference catalog
$pdo->exec("DELETE FROM `reasons`");

function gen_uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

$reasons_data = [
"""

items = []
total_count = 0
unmatched_translations = set()
unmatched_sections = set()

for section, motifs in sections.items():
    spec_ar = section_to_specialty_ar.get(section)
    if not spec_ar:
        unmatched_sections.add(section)
        continue
    for m in motifs:
        ar_trans = translations.get(m)
        if not ar_trans:
            unmatched_translations.add(m)
            ar_trans = m  # fallback
        m_esc = m.replace("'", "\\'")
        ar_esc = ar_trans.replace("'", "\\'")
        items.append(f"    ['section' => '{section}', 'spec_ar' => '{spec_ar}', 'namefr' => '{m_esc}', 'namear' => '{ar_esc}']")
        total_count += 1

print(f"Prepared {total_count} reasons across {len(sections)} sections.")
if unmatched_translations:
    print(f"Warning: {len(unmatched_translations)} unmatched translations: {unmatched_translations}")
if unmatched_sections:
    print(f"Warning: {len(unmatched_sections)} unmatched sections: {unmatched_sections}")

php_script += ",\n".join(items) + "\n];\n\n"

php_script += """
$insert_header = "INSERT INTO `reasons` (`id`, `name`, `namear`, `namefr`, `specialtie_id`) VALUES ";
$batch_size = 100;
$values = [];
$params = [];
$total_inserted = 0;

foreach ($reasons_data as $r) {
    $spec_id = $spec_map[$r['spec_ar']] ?? null;
    if (!$spec_id) {
        echo "Error: specialty not found for " . $r['spec_ar'] . "\\n";
        continue;
    }
    
    $id = gen_uuid();
    $values[] = "(?, ?, ?, ?, ?)";
    $params[] = $id;
    $params[] = $r['namefr'];
    $params[] = $r['namear'];
    $params[] = $r['namefr'];
    $params[] = $spec_id;
    
    if (count($values) >= $batch_size) {
        $stmt = $pdo->prepare($insert_header . implode(',', $values));
        $stmt->execute($params);
        $total_inserted += count($values);
        $values = [];
        $params = [];
    }
}

if (!empty($values)) {
    $stmt = $pdo->prepare($insert_header . implode(',', $values));
    $stmt->execute($params);
    $total_inserted += count($values);
}

echo "=== SUCCESSFULLY INSERTED $total_inserted REASONS INTO DATABASE ===\\n";
"""

with open(r"d:\Application Web\WebTabibi\scratch\insert_reasons.php", "w", encoding="utf-8") as f:
    f.write(php_script)

print("Generated scratch/insert_reasons.php successfully!")
