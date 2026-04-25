<?php
$dir = 'c:\xampp\htdocs\WebTabibi\backend';
$uppercaseWords = [];

$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
foreach ($files as $file) {
    if ($file->isDir()) continue;
    $content = file_get_contents($file->getPathname());
    
    // Find strings
    preg_match_all('/(["\'])(.*?)\1/', $content, $matches);
    foreach ($matches[2] as $str) {
        // Look for uppercase words in the string (likely SQL or keys)
        // Words with at least one uppercase letter, length >= 2
        preg_match_all('/\b[A-Z][a-zA-Z0-9_]*\b/', $str, $wordMatches);
        foreach ($wordMatches[0] as $word) {
            $uppercaseWords[$word] = true;
        }
    }
}

echo "UPPERCASE WORDS IN STRINGS:\n";
print_r(array_keys($uppercaseWords));
