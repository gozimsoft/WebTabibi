<?php
$uploadDir = 'C:/Users/khale/.gemini/antigravity-ide/brain/1687df26-8961-4ed3-bfc5-ca59603bdf52/.user_uploaded';
$files = glob("$uploadDir/*.*");
foreach ($files as $f) {
    $info = getimagesize($f);
    echo basename($f) . ":\n";
    echo "  Dimensions: {$info[0]} x {$info[1]}\n";
    echo "  Mime: {$info['mime']}\n";
    echo "  Size: " . filesize($f) . " bytes (" . round(filesize($f)/1024, 2) . " KB)\n";
    $ratio = $info[0] / $info[1];
    echo "  Aspect Ratio: " . round($ratio, 4) . " (16:9 is ~1.7778)\n\n";
}
