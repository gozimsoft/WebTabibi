<?php
$file = 'C:/Users/khale/.gemini/antigravity-ide/brain/8e3bfc44-ad05-4e7a-8b20-95eca58dbc6f/.system_generated/logs/transcript.jsonl';
$handle = fopen($file, 'r');
while (($line = fgets($handle)) !== false) {
    $item = json_decode($line, true);
    if ($item && ($item['type'] ?? '') === 'USER_INPUT') {
        if (strpos($item['content'] ?? '', 'Badge') !== false || strpos($item['content'] ?? '', 'Profil PATIENT') !== false) {
            echo "--- USER INPUT ---\n";
            echo $item['content'] . "\n";
        }
    }
}
fclose($handle);
