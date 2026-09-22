<?php
$url = 'https://raw.githubusercontent.com/othmanus/algeria-cities/master/json/algeria_postcodes.json';
$ctx = stream_context_create([
    'http' => ['timeout' => 15],
    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
]);
$fp = fopen($url, 'r', false, $ctx);
if ($fp) {
    $content = fread($fp, 2000);
    echo $content;
    fclose($fp);
}
