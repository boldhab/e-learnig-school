<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Helpers\JwtHelper;

class AuthService {
    protected $userRepository;

    public function __construct() {
        $this->userRepository = new UserRepository();
    }

    public function authenticateUser($login, $password, $ip) {
        $user = $this->userRepository->findByUsernameOrEmail($login);

        if (!$user || !password_verify($password, $user['password'])) {
            return false;
        }

        if ($user['status'] !== 'active') {
            throw new \Exception("Account is deactivated");
        }

        // Log login
        $this->userRepository->logLogin($user['id'], $ip);

        // Generate JWT
        $payload = [
            'id' => $user['id'],
            'user_id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role_name'],
            'role_name' => $user['role_name']
        ];

        return [
            'token' => JwtHelper::generate($payload),
            'user' => [
                'id' => $user['id'],
                'full_name' => $user['full_name'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role_name'],
                'role_name' => $user['role_name'],
                'class_id' => $user['class_id'] ?? null
            ]
        ];
    }
}
