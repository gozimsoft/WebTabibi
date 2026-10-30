<?php
$token = $argv[1] ?? '';
$b64 = $argv[2] ?? '';
$payloadJson = base64_decode($b64);

$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;

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
MockPhpStream::setData($payloadJson);

require_once __DIR__ . '/../backend/controllers/AppointmentController.php';
AppointmentController::book();
