<?php
$lines = file('D:/Delphi/programs/Clinic/uCreateDatabase.pas');
$tables = [];
foreach ($lines as $idx => $line) {
    if (preg_match('/INSERT INTO `?(\w+)`?/i', $line, $m)) {
        $tables[$m[1]][] = $idx + 1;
    }
}
foreach ($tables as $tbl => $lineArr) {
    echo $tbl . ': ' . count($lineArr) . ' rows, from line ' . min($lineArr) . ' to ' . max($lineArr) . "\n";
}
