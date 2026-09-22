<?php
$url = 'https://raw.githubusercontent.com/othmanus/algeria-cities/master/sql/algeria_cities.sql';
$ctx = stream_context_create([
    'http' => ['timeout' => 15],
    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
]);
$fp = fopen($url, 'r', false, $ctx);
if ($fp) {
    for ($i = 0; $i < 35; $i++) {
        $line = fgets($fp);
        echo $line;
    }
    fclose($fp);
}
