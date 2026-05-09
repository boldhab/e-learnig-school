<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use App\Traits\LoggerTrait;
use App\Helpers\HtmlSanitizer;
use App\Core\Validation;

class AuthController {
    use ApiResponseTrait, LoggerTrait;

    protected $authService;
    protected $validation;

    public function __construct() {
        $this->authService = new AuthService();
        $this->validation = new Validation();
    }

    public function login(Request $request, Response $response) {
        $data = HtmlSanitizer::sanitize($request->getBody());
        
        if (!$this->validation->validate($data, [
            'login' => 'required',
            'password' => 'required'
        ])) {
            return $this->error('Validation failed', 422, $this->validation->getErrors());
        }

        try {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
            $result = $this->authService->authenticateUser($data['login'], $data['password'], $ip);

            if (!$result) {
                return $this->error('Invalid credentials', 401);
            }

            return $this->success($result, 'Login successful');
        } catch (\Exception $e) {
            $this->logError($e->getMessage());
            return $this->error($e->getMessage(), 400);
        }
    }

    public function me(Request $request, Response $response) {
        $auth = new \App\Middleware\AuthMiddleware();
        $auth->handle($request, $response);
        $user = $GLOBALS['auth_user'] ?? null;
        if (!$user) {
            return $this->error('Unauthorized', 401);
        }
        return $this->success($user);
    }

    public function logout(Request $request, Response $response) {
        return $this->success([], 'Logged out successfully');
    }
}
