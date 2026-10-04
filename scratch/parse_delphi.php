<?php
$rootDir = 'D:/Github/Utopya';
$targetDir = 'D:/Github/Utopia_react';

$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($rootDir, FilesystemIterator::SKIP_DOTS));

$forms = [];
$controllers = [];
$queries = [];

foreach ($files as $file) {
    if ($file->isDir()) continue;
    $ext = strtolower($file->getExtension());
    $filePath = str_replace('\\', '/', $file->getPathname());
    
    // Ignore history, recovery and win32
    if (strpos($filePath, '/__history/') !== false || strpos($filePath, '/__recovery/') !== false || strpos($filePath, '/Win32/') !== false || strpos($filePath, '/.git/') !== false) {
        continue;
    }
    
    if ($ext === 'dfm') {
        $content = file_get_contents($filePath);
        $formName = pathinfo($filePath, PATHINFO_FILENAME);
        
        // Extract object declarations
        preg_match_all('/object\s+(\w+):\s*(\w+)/i', $content, $matches, PREG_SET_ORDER);
        $components = [];
        foreach ($matches as $m) {
            $components[] = [
                'name' => $m[1],
                'type' => $m[2]
            ];
        }
        
        // Extract SQL queries
        preg_match_all('/SQL\.Strings\s*=\s*\(\s*([^)]+)\)/is', $content, $sqlMatches);
        $extractedSql = [];
        if (!empty($sqlMatches[1])) {
            foreach ($sqlMatches[1] as $s) {
                $cleaned = preg_replace("/\r?\n\s*'/", " ", $s);
                $cleaned = str_replace("'", "", $cleaned);
                $cleaned = trim(preg_replace('/\s+/', ' ', $cleaned));
                if (!empty($cleaned)) {
                    $extractedSql[] = $cleaned;
                }
            }
        }
        
        $forms[$formName] = [
            'file' => str_replace('D:/Github/Utopya/', '', $filePath),
            'component_count' => count($components),
            'components' => array_slice($components, 0, 30),
            'sql_queries' => $extractedSql
        ];
    }
    
    if ($ext === 'pas') {
        $content = file_get_contents($filePath);
        $unitName = pathinfo($filePath, PATHINFO_FILENAME);
        
        // Look for procedure/function definitions
        preg_match_all('/(procedure|function)\s+([A-Za-z0-9_.]+)\s*(\([^)]*\))?\s*(:\s*[A-Za-z0-9_]+)?;/i', $content, $procMatches, PREG_SET_ORDER);
        $procedures = [];
        foreach ($procMatches as $pm) {
            $procedures[] = [
                'kind' => strtolower($pm[1]),
                'name' => $pm[2],
                'params' => $pm[3] ?? '',
                'return' => trim($pm[4] ?? '')
            ];
        }
        
        // Look for SQL string constants or assignments
        preg_match_all('/(SELECT\s+[^;\'"]+FROM\s+[^;\'"]+)/i', $content, $sqlCodeMatches);
        $codeSql = [];
        if (!empty($sqlCodeMatches[1])) {
            foreach ($sqlCodeMatches[1] as $cSql) {
                $cSql = trim(preg_replace('/\s+/', ' ', $cSql));
                if (strlen($cSql) < 500) {
                    $codeSql[] = $cSql;
                }
            }
        }
        
        $controllers[$unitName] = [
            'file' => str_replace('D:/Github/Utopya/', '', $filePath),
            'procedure_count' => count($procedures),
            'procedures' => array_slice($procedures, 0, 50),
            'embedded_sql' => array_unique(array_slice($codeSql, 0, 15))
        ];
    }
}

file_put_contents("$targetDir/delphi_forms_map.json", json_encode($forms, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
file_put_contents("$targetDir/delphi_units_map.json", json_encode($controllers, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Extracted " . count($forms) . " DFM Forms and " . count($controllers) . " Pascal Units!\n";
