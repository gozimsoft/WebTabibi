<?php
// Script to convert images to exact Play Store specifications:
// - Aspect Ratio: 16:9
// - Dimensions: 1920 x 1080 px (each side between 1080 and 7680)
// - Formats: PNG and JPG (< 8MB)
// - High quality Lanczos/Bicubic resampling

$inputDir = 'C:/Users/khale/.gemini/antigravity-ide/brain/1687df26-8961-4ed3-bfc5-ca59603bdf52/.user_uploaded';
$outputDir1 = 'c:/xampp/htdocs/tabibi/playstore_assets';
$outputDir2 = 'C:/Users/khale/.gemini/antigravity-ide/brain/1687df26-8961-4ed3-bfc5-ca59603bdf52/playstore_assets';

@mkdir($outputDir1, 0777, true);
@mkdir($outputDir2, 0777, true);

$files = glob("$inputDir/*.*");
sort($files);

$targetW = 1920;
$targetH = 1080;
$targetRatio = 16.0 / 9.0; // 1.7777777778

$names = [
    1 => '01_tabibi_annuaire_medecins',
    2 => '02_tabibi_reservation_rendezvous',
    3 => '03_tabibi_spatial_xr_consultation',
    4 => '04_tabibi_spatial_xr_localisation'
];

$index = 1;
foreach ($files as $file) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if ($ext === 'png') {
        $srcImg = imagecreatefrompng($file);
    } elseif ($ext === 'jpg' || $ext === 'jpeg') {
        $srcImg = imagecreatefromjpeg($file);
    } else {
        continue;
    }

    if (!$srcImg) {
        echo "Failed to load $file\n";
        continue;
    }

    $srcW = imagesx($srcImg);
    $srcH = imagesy($srcImg);
    $srcRatio = $srcW / $srcH;

    // We do a smart slight center-crop so the aspect ratio is precisely 16:9 before scaling
    // srcRatio is ~1.7933, targetRatio is 1.7778
    // So src is slightly wider than 16:9.
    $cropH = $srcH;
    $cropW = (int)round($cropH * $targetRatio);
    if ($cropW > $srcW) {
        $cropW = $srcW;
        $cropH = (int)round($cropW / $targetRatio);
    }

    $cropX = (int)floor(($srcW - $cropW) / 2);
    $cropY = (int)floor(($srcH - $cropH) / 2);

    $cropped = imagecreatetruecolor($cropW, $cropH);
    // preserve alpha if any
    imagealphablending($cropped, false);
    imagesavealpha($cropped, true);
    imagecopy($cropped, $srcImg, 0, 0, $cropX, $cropY, $cropW, $cropH);

    // Now resample to 1920x1080 using highest quality
    $finalImg = imagecreatetruecolor($targetW, $targetH);
    imagealphablending($finalImg, false);
    imagesavealpha($finalImg, true);

    imagecopyresampled($finalImg, $cropped, 0, 0, 0, 0, $targetW, $targetH, $cropW, $cropH);

    $baseName = $names[$index] ?? ("tabibi_playstore_" . $index);

    // Save PNG
    $outPng1 = "$outputDir1/{$baseName}.png";
    $outPng2 = "$outputDir2/{$baseName}.png";
    imagepng($finalImg, $outPng1, 8);
    imagepng($finalImg, $outPng2, 8);

    // Save JPG (quality 95)
    // For JPG, create a white-backed image to ensure no transparency black background
    $jpgCanvas = imagecreatetruecolor($targetW, $targetH);
    $white = imagecolorallocate($jpgCanvas, 255, 255, 255);
    imagefilledrectangle($jpgCanvas, 0, 0, $targetW, $targetH, $white);
    imagecopy($jpgCanvas, $finalImg, 0, 0, 0, 0, $targetW, $targetH);

    $outJpg1 = "$outputDir1/{$baseName}.jpg";
    $outJpg2 = "$outputDir2/{$baseName}.jpg";
    imagejpeg($jpgCanvas, $outJpg1, 95);
    imagejpeg($jpgCanvas, $outJpg2, 95);

    echo "Processed Image $index:\n";
    echo "  Original: $srcW x $srcH ($ext)\n";
    echo "  Cropped: $cropW x $cropH (cropped $cropX px left/right, $cropY px top/bottom)\n";
    echo "  Target: $targetW x $targetH (Exact 16:9)\n";
    echo "  PNG size: " . round(filesize($outPng1) / 1024, 2) . " KB\n";
    echo "  JPG size: " . round(filesize($outJpg1) / 1024, 2) . " KB\n\n";

    imagedestroy($srcImg);
    imagedestroy($cropped);
    imagedestroy($finalImg);
    imagedestroy($jpgCanvas);

    $index++;
}
