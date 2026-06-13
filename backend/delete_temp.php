<?php
echo "Cleaning up all temp files...\n";
@unlink(__DIR__ . '/verify_baladiyas.php');
@unlink(__DIR__ . '/../verify_baladiyas.php');
@unlink(__DIR__ . '/test_search_wilaya.php');
@unlink(__DIR__ . '/../test_search_wilaya.php');
@unlink(__DIR__ . '/test_data.php');
@unlink(__DIR__ . '/../test_data.php');
@unlink(__DIR__ . '/../delete_temp.php');
echo "Cleanup done.\n";
@unlink(__FILE__);
