<?php
// ============================================================
// core/Response.php
// ============================================================
class Response {
    public static function json(bool $success, mixed $data = null, string $message = '', int $code = 200): void {
        http_response_code($code);
        $body = ['success' => $success, 'message' => $message];
        if ($data !== null) {
            $body['data'] = $data;
        }
        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'OK', int $code = 200): void {
        self::json(true, $data, $message, $code);
    }

    public static function error(string $message = 'Error', int $code = 400, mixed $data = null): void {
        self::json(false, $data, $message, $code);
    }

    public static function unauthorized(string $message = 'Unauthorized'): void {
        self::json(false, null, $message, 401);
    }

    public static function notFound(string $message = 'Not found'): void {
        self::json(false, null, $message, 404);
    }

    public static function serverError(string $message = 'Internal server error'): void {
        self::json(false, null, $message, 500);
    }
}
