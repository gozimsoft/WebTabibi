<?php
$rootDir = 'D:/Github/Utopya';

$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($rootDir, FilesystemIterator::SKIP_DOTS));
$exts = [];
$totalSize = 0;
$count = 0;
$dbFiles = [];

foreach ($files as $file) {
    if ($file->isDir()) continue;
    $count++;
    $totalSize += $file->getSize();
    $ext = strtolower($file->getExtension());
    $exts[$ext] = ($exts[$ext] ?? 0) + 1;
    $name = strtolower($file->getFilename());
    if (in_array($ext, ['sql', 'db', 'bak', 'mdb', 'fdb', 'sqlite', 'ini', 'json', 'bat']) || 
        strpos($name, 'db') !== false || 
        strpos($name, 'schema') !== false ||
        strpos($name, 'table') !== false) {
        $dbFiles[] = [
            'path' => str_replace('\\', '/', $file->getPathname()),
            'size_kb' => round($file->getSize() / 1024, 2)
        ];
    }
}

echo "Total files: $count\n";
echo "Total size: " . round($totalSize / (1024 * 1024), 2) . " MB\n";
echo "Extensions summary:\n";
arsort($exts);
print_r(array_slice($exts, 0, 25));

echo "\nDatabase / Config / Script files found:\n";
print_r($dbFiles);
