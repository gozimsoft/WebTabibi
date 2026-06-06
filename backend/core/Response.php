<?php

class Response
{
    public static function json($success, $data = null, $message = '', $code = 200): void
    {
        http_response_code($code);

        $body = [
            'success' => $success,
            'message' => $message,
        ];

        if ($data !== null) {
            $body['data'] = $data;
        }

        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success($data = null, $message = 'OK', $code = 200): void
    {
        self::json(true, $data, $message, $code);
    }

    public static function error($message = 'Error', $code = 400, $data = null): void
    {
        self::json(false, $data, $message, $code);
    }

    public static function notFound($message = 'Not found'): void
    {
        self::json(false, null, $message, 404);
    }

    public static function serverError($message = 'Internal server error'): void
    {
        self::json(false, null, $message, 500);
    }

    public static function unauthorized($message = 'Unauthorized'): void
    {
        self::json(false, null, $message, 401);
    }
}