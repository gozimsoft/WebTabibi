<?php
$lines = file('D:/Github/Utopya/Login/LoginU.pas');
echo implode('', array_slice($lines, 0, 80));

echo "\n--- DFM ---\n";
$dfm = file_get_contents('D:/Github/Utopya/Login/LoginU.dfm');
preg_match_all('/object\s+(\w+):\s*(\w+)/i', $dfm, $matches, PREG_SET_ORDER);
foreach (array_slice($matches, 0, 25) as $m) {
    echo $m[1] . ' : ' . $m[2] . "\n";
}
