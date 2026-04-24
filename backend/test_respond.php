<?php
require 'core/Database.php';
require 'core/Response.php';
require 'controllers/RelationController.php';

// Mock session/user
class AuthMiddleware {
    public static function authenticate() {
        return [
            'user_id' => '95b2633d-426a-4c58-b38f-ff3a64a4c5ec', // Clinic User
            'UserType' => 2
        ];
    }
}

// Mock input
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST = [];
$input = json_encode(['action' => 'accept']);
file_put_contents('php://input', $input);

try {
    RelationController::respondToRequest('e2dd9971-c4fd-465c-b6e1-8657d10783e6');
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
