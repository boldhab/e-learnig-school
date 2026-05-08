<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;

abstract class BaseController {
    protected function requireAuth() {
        $auth = new AuthMiddleware();
        $auth->handle(new Request(), new Response());
    }

    protected function requireRole($roles) {
        $this->requireAuth();
        $roleMiddleware = new RoleMiddleware();
        
        if (is_array($roles)) {
            $authorized = false;
            foreach ($roles as $role) {
                if ($roleMiddleware->check($role)) {
                    $authorized = true;
                    break;
                }
            }
            if (!$authorized) {
                (new Response())->json([], 'error', 'Forbidden: Insufficient permissions', 403);
                exit;
            }
        } else {
            $roleMiddleware->handle(new Request(), new Response(), $roles);
        }
    }

    protected function success($data = [], $message = 'Success', $code = 200) {
        (new Response())->json($data, 'success', $message, $code);
        exit;
    }

    protected function error($message = 'Error', $code = 400, $data = []) {
        (new Response())->json($data, 'error', $message, $code);
        exit;
    }
}
