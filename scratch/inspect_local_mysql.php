<?php
$mysqli = new mysqli("127.0.0.1", "root", "", "dbtabibi");
echo "=== COLUMNS in settingapointements ===\n";
$res = $mysqli->query("DESCRIBE settingapointements");
if ($res) {
    while ($r = $res->fetch_assoc()) {
        echo "{$r['Field']} ({$r['Type']})\n";
    }
} else {
    echo "Error: " . $mysqli->error . "\n";
}

echo "\n=== COLUMNS in apointements ===\n";
$res = $mysqli->query("DESCRIBE apointements");
if ($res) {
    while ($r = $res->fetch_assoc()) {
        echo "{$r['Field']} ({$r['Type']})\n";
    }
} else {
    echo "Error: " . $mysqli->error . "\n";
}
