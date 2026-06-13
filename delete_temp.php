<?php
echo "Root delete_temp.php loaded. Directory: " . __DIR__ . "\n";
@unlink(__DIR__ . '/verify_baladiyas.php');
@unlink(__DIR__ . '/test_data.php');
