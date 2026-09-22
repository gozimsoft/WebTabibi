<?php
$url = 'https://raw.githubusercontent.com/othmanus/algeria-cities/master/json/algeria_cities.json';
$ctx = stream_context_create([
    'http' => ['timeout' => 15],
    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
]);
$data = file_get_contents($url, false, $ctx);
if ($data) {
    file_put_contents(__DIR__ . '/algeria_cities_ref.json', $data);
    $json = json_decode($data, true);
    echo "Downloaded successfully! Count: " . count($json) . "\n";
    echo "Sample:\n" . json_encode($json[0], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
} else {
    echo "Failed to download\n";
}
