<?php
$dir = 'c:\xampp\htdocs\WebTabibi';
$tables = [];
$columns = [];

function scan_dir($path) {
    global $tables, $columns;
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));
    foreach ($files as $file) {
        if ($file->isDir()) continue;
        if (strpos($file->getPathname(), '.git') !== false) continue;
        if (strpos($file->getPathname(), 'node_modules') !== false) continue;
        
        $content = file_get_contents($file->getPathname());
        
        // Extract table names from FROM, JOIN, INTO, UPDATE, TABLE
        // Looking for [A-Z]
        preg_match_all('/\b(FROM|JOIN|INTO|UPDATE|TABLE|ALTER TABLE|CREATE TABLE|REFERENCES)\s+`?([A-Za-z0-9_]+)`?/i', $content, $matches);
        foreach ($matches[2] as $match) {
            if (preg_match('/[A-Z]/', $match)) {
                $tables[strtolower($match)] = $match;
            }
        }
        
        // Extract column names from SELECT, WHERE, SET, ADD COLUMN
        // This is harder because columns can be anything. 
        // But I can look for backticks or things like u.ID, d.User_id
        preg_match_all('/([a-z]\.)`?([A-Za-z0-9_]+)`?/i', $content, $matches);
        foreach ($matches[2] as $match) {
            if (preg_match('/[A-Z]/', $match)) {
                $columns[strtolower($match)] = $match;
            }
        }
        
        // Also look for assignments in controllers $allowed = [...]
        preg_match_all('/\'([A-Z][A-Za-z0-9_]+)\'/', $content, $matches);
        foreach ($matches[1] as $match) {
             $columns[strtolower($match)] = $match;
        }
    }
}

scan_dir($dir . '/backend');
// scan_dir($dir . '/frontend'); // Frontend might have them in JSON responses

echo "TABLES:\n";
print_r($tables);
echo "\nCOLUMNS:\n";
print_r($columns);
