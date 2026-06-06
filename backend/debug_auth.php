<?php
// ================================================================
// debug_auth.php — ملف تشخيص مؤقت (احذفه بعد الاختبار!)
// افتح هذا الرابط على الاستضافة:
//   https://your-domain.com/api/debug_auth.php
//   أو: https://your-domain.com/backend/debug_auth.php
// ================================================================
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 1) محتوى $_SERVER المتعلق بـ Authorization
$serverAuth = [
    'HTTP_AUTHORIZATION'          => $_SERVER['HTTP_AUTHORIZATION']          ?? 'غير موجود',
    'REDIRECT_HTTP_AUTHORIZATION' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'غير موجود',
    'PHP_AUTH_USER'               => $_SERVER['PHP_AUTH_USER']               ?? 'غير موجود',
];

// 2) getallheaders() إن كانت متاحة
$allHeaders = [];
if (function_exists('getallheaders')) {
    $allHeaders = getallheaders();
    $allHeaders['_function_exists'] = true;
} else {
    $allHeaders = ['_function_exists' => false];
}

// 3) معلومات PHP البيئة
$phpInfo = [
    'php_version'  => PHP_VERSION,
    'sapi_name'    => php_sapi_name(),    // apache2handler أو cgi-fcgi أو fpm-fcgi
    'server_soft'  => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    'request_uri'  => $_SERVER['REQUEST_URI']       ?? '',
    'request_method' => $_SERVER['REQUEST_METHOD']  ?? '',
];

echo json_encode([
    'success'      => true,
    'server_auth'  => $serverAuth,
    'all_headers'  => $allHeaders,
    'php_env'      => $phpInfo,
    'note'         => 'احذف هذا الملف بعد الاختبار!',
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
