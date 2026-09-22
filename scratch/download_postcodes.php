<?php
$url = 'https://raw.githubusercontent.com/othmanus/algeria-cities/master/json/algeria_postcodes.json';
$ctx = stream_context_create([
    'http' => ['timeout' => 20],
    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
]);
$data = file_get_contents($url, false, $ctx);
if ($data) {
    file_put_contents(__DIR__ . '/algeria_postcodes.json', $data);
    $json = json_decode($data, true);
    echo "Downloaded postcodes: " . count($json) . " entries\n";
} else {
    echo "Failed to download postcodes\n";
}
