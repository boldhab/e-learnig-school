<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\UserService;
use App\Traits\ApiResponseTrait;
use App\Traits\LoggerTrait;
use App\Helpers\HtmlSanitizer;
use App\Middleware\AuthMiddleware;

class UserController {
    use ApiResponseTrait, LoggerTrait;

    protected $userService;

    public function __construct() {
        $this->userService = new UserService();
        
        $auth = new AuthMiddleware();
        $auth->handle(new Request(), new Response());
    }

    public function getProfile(Request $request, Response $response) {
        $authUser = $GLOBALS['auth_user'];
        $user = $this->userService->getUserById($authUser['user_id']);
        
        if (!$user) {
            return $this->error('User not found', 404);
        }

        // Remove password from response
        unset($user['password']);
        return $this->success($user);
    }

    public function updateProfile(Request $request, Response $response) {
        $authUser = $GLOBALS['auth_user'];
        $data = HtmlSanitizer::sanitize($request->getBody());
        
        // Allowed fields for self-update
        $updateData = array_intersect_key($data, array_flip(['full_name', 'phone_number', 'gender']));

        try {
            $this->userService->updateUser($authUser['user_id'], $updateData);
            return $this->success([], 'Profile updated successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function changePassword(Request $request, Response $response) {
        $authUser = $GLOBALS['auth_user'];
        $data = $request->getBody();

        if (empty($data['new_password'])) {
            return $this->error('New password is required', 400);
        }

        try {
            $this->userService->updateUser($authUser['user_id'], ['password' => $data['new_password']]);
            return $this->success([], 'Password changed successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
