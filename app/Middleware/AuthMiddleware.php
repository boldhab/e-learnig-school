<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\JwtHelper;

class AuthMiddleware {
    public function handle(Request $request, Response $response) {
        $headers = $request->getHeaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = '';

        if ($authHeader && strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
        } elseif (isset($_GET['token'])) {
            $token = $_GET['token'];
        }

        if (!$token) {
            $response->json([], 'error', 'Unauthorized: Token missing', 401);
            exit;
        }

        $userData = JwtHelper::verify($token);

        if (!$userData) {
            $response->json([], 'error', 'Unauthorized: Invalid or expired token', 401);
            exit;
        }

        // Attach user to request for later use
        $GLOBALS['auth_user'] = $userData;
        
        return true;
    }
}
