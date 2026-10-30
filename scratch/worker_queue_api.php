<?php
$method = $argv[1] ?? 'GET';
$action = $argv[2] ?? '';
$token = $argv[3] ?? '';
$param1 = $argv[4] ?? '';
$b64 = $argv[5] ?? '';
$body = json_decode(base64_decode($b64), true) ?? [];

$_SERVER['REQUEST_METHOD'] = $method;
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;

if ($method === 'GET') {
    $_GET = $body;
}

// Mock php://input
stream_wrapper_unregister("php");
class MockPhpStream {
    public $context;
    private static $data = '';
    public static function setData($d) { self::$data = $d; }
    public function stream_open($path, $mode, $options, &$opened_path) { return true; }
    public function stream_read($count) {
        $ret = substr(self::$data, 0, $count);
        self::$data = substr(self::$data, $count);
        return $ret;
    }
    public function stream_eof() { return strlen(self::$data) === 0; }
    public function stream_stat() { return []; }
}
stream_wrapper_register("php", "MockPhpStream");
MockPhpStream::setData(json_encode($body));

require_once __DIR__ . '/../backend/controllers/AppointmentController.php';

if ($action === 'updateQueueStatus') {
    AppointmentController::updateQueueStatus($param1);
} elseif ($action === 'getLiveQueueStatus') {
    AppointmentController::getLiveQueueStatus();
}
