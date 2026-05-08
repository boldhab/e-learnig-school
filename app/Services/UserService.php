<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Exception;

class UserService {
    protected $userRepository;

    public function __construct() {
        $this->userRepository = new UserRepository();
    }

    public function createStudent($data) {
        $data['role_id'] = (require(__DIR__ . '/../../config/roles.php'))['STUDENT'];
        $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        return $this->userRepository->createUser($data);
    }

    public function createTeacher($data) {
        $data['role_id'] = (require(__DIR__ . '/../../config/roles.php'))['TEACHER'];
        $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        return $this->userRepository->createUser($data);
    }

    public function updateUser($id, $data) {
        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }
        return $this->userRepository->updateUser($id, $data);
    }

    public function deactivateUser($id) {
        return $this->userRepository->changeStatus($id, 'inactive');
    }

    public function getAllUsers() {
        return $this->userRepository->getAllUsers();
    }

    public function getUserById($id) {
        return $this->userRepository->findById($id);
    }
}
