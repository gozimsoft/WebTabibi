<?php
$content = file_get_contents(__DIR__ . '/../frontend/src/App.jsx');
$lines = explode("\n", $content);
foreach ($lines as $idx => $line) {
    if (strpos($line, 'adminActiveTab') !== false || strpos($line, 'user?.user_type === 3') !== false || strpos($line, 'user.user_type === 3') !== false || strpos($line, 'user?.user_type === 4') !== false) {
        echo "Line " . ($idx + 1) . ": " . trim($line) . "\n";
    }
}
