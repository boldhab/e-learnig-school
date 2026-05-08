<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\JwtHelper;

class AuthMiddleware {
    public function handle(Request $request, Response $response) {
        $headers = $request->getHeaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!$authHeader || strpos($authHeader, 'Bearer ') !== 0) {
            $response->json([], 'error', 'Unauthorized: Token missing', 401);
        }

        $token = substr($authHeader, 7);
        $userData = JwtHelper::verify($token);

        if (!$userData) {
            $response->json([], 'error', 'Unauthorized: Invalid or expired token', 401);
        }

        // Attach user to request for later use
        $GLOBALS['auth_user'] = $userData;
        
        return true;
    }
}
