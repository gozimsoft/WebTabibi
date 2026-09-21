<?php
$dir = new RecursiveDirectoryIterator(__DIR__ . '/../backend');
$it = new RecursiveIteratorIterator($dir);
$bomFiles = [];

foreach ($it as $file) {
    if ($file->isFile() && $file->getExtension() === 'php') {
        $content = file_get_contents($file->getPathname());
        if (substr($content, 0, 3) === "\xEF\xBB\xBF") {
            $bomFiles[] = $file->getPathname();
            // strip BOM
            file_put_contents($file->getPathname(), substr($content, 3));
            echo "Stripped BOM from: " . $file->getPathname() . "\n";
        }
    }
}

if (empty($bomFiles)) {
    echo "No BOM files found in backend.\n";
}
