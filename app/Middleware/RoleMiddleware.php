<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

class RoleMiddleware {
    public function handle(Request $request, Response $response, $requiredRole) {
        if (!$this->check($requiredRole)) {
            $response->json([], 'error', 'Forbidden: Insufficient permissions', 403);
        }
    }

    public function check($requiredRole) {
        $user = $GLOBALS['auth_user'] ?? null;

        if (!$user) {
            return false;
        }

        return $user['role'] === $requiredRole;
    }
}
