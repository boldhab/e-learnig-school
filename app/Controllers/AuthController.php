<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use App\Traits\LoggerTrait;
use App\Helpers\HtmlSanitizer;
use App\Core\Validation;
use App\Services\UserService;
use App\Services\AdminService;
use App\Core\Database;

class AuthController {
    use ApiResponseTrait, LoggerTrait;

    protected $authService;
    protected $validation;
    protected $userService;
    protected $adminService;

    public function __construct() {
        $this->authService = new AuthService();
        $this->validation = new Validation();
        $this->userService = new UserService();
        $this->adminService = new AdminService();
    }

    public function register(Request $request, Response $response) {
        $data = HtmlSanitizer::sanitize($request->getBody());

        if (!$this->validation->validate($data, [
            'full_name' => 'required',
            'username' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6'
        ])) {
            return $this->error('Validation failed', 422, $this->validation->getErrors());
        }

        try {
            // Create the student record
            $userId = $this->userService->createStudent($data);

            $classId = null;

            // If frontend provided a numeric class_id, prefer it
            if (!empty($data['class_id'])) {
                $classId = (int)$data['class_id'];
            } elseif (!empty($data['grade_name']) || !empty($data['grade'])) {
                $gradeName = trim($data['grade_name'] ?? $data['grade']);
                if ($gradeName !== '') {
                    $db = Database::getInstance();
                    $stmt = $db->prepare("SELECT id FROM categories WHERE type = 'Grade' AND LOWER(name) = LOWER(?) LIMIT 1");
                    $stmt->execute([$gradeName]);
                    $found = $stmt->fetchColumn();
                    if ($found) {
                        $classId = (int)$found;
                    } else {
                        $ins = $db->prepare("INSERT INTO categories (name, type, parent_id) VALUES (?, 'Grade', NULL)");
                        $ins->execute([$gradeName]);
                        $classId = (int)$db->lastInsertId();
                    }
                }
            }

            if (!empty($classId)) {
                try {
                    $this->adminService->assignStudentToClass((int)$userId, $classId);
                } catch (\Exception $e) {
                    // don't fail registration for assignment problems; log and continue
                    $this->logError('Student created but failed to assign class: ' . $e->getMessage());
                }
            }

            $this->success(['user_id' => $userId, 'class_id' => $classId], 'Registration successful', 201);
        } catch (\Exception $e) {
            $this->logError($e->getMessage());
            return $this->error('Registration failed: ' . $e->getMessage(), 400);
        }
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
