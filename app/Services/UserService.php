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
        $db = \App\Core\Database::getInstance();
        try {
            $db->beginTransaction();

            $data['role_id'] = (require(__DIR__ . '/../../config/roles.php'))['STUDENT'];
            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
            $studentId = $this->userRepository->createUser($data);

            if (!empty($data['parent_email']) && !empty($data['parent_name'])) {
                $parentRepo = new \App\Repositories\ParentRepository();
                $existingParent = $parentRepo->getParentByEmail($data['parent_email']);
                
                if ($existingParent) {
                    $parentId = $existingParent['id'];
                } else {
                    if (empty($data['parent_password'])) {
                        throw new Exception("Parent password is required for new parent accounts");
                    }
                    $parentData = [
                        'full_name' => $data['parent_name'],
                        'email' => $data['parent_email'],
                        'username' => explode('@', $data['parent_email'])[0] . '_' . rand(100, 999),
                        'password' => password_hash($data['parent_password'], PASSWORD_BCRYPT),
                        'role_id' => (require(__DIR__ . '/../../config/roles.php'))['PARENT'],
                        'status' => 'active'
                    ];
                    $parentId = $this->userRepository->createUser($parentData);
                }

                $relationship = $data['relationship_type'] ?? 'guardian';
                $parentRepo->createParentStudentLink($parentId, $studentId, $relationship);
            }

            $db->commit();
            return $studentId;
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
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

        // Handle parent data separately if provided
        $parentData = [];
        $parentFields = ['parent_name', 'parent_email', 'parent_password', 'relationship_type'];
        foreach ($parentFields as $field) {
            if (array_key_exists($field, $data)) {
                $parentData[$field] = $data[$field];
                unset($data[$field]);
            }
        }

        $result = $this->userRepository->updateUser($id, $data);

        // Update or create parent link if parent email is provided
        if (!empty($parentData['parent_email'])) {
            $parentRepo = new \App\Repositories\ParentRepository();
            $existingParent = $parentRepo->getParentByEmail($parentData['parent_email']);
            $parentId = null;

            if ($existingParent) {
                $parentId = $existingParent['id'];
                // Update parent name if requested
                if (!empty($parentData['parent_name'])) {
                    $this->userRepository->updateUser($parentId, ['full_name' => $parentData['parent_name']]);
                }
                // Update parent password if provided
                if (!empty($parentData['parent_password'])) {
                    $this->userRepository->updateUser($parentId, ['password' => password_hash($parentData['parent_password'], PASSWORD_BCRYPT)]);
                }
            } else {
                // Create new parent
                if (!empty($parentData['parent_name'])) {
                    $newParentData = [
                        'full_name' => $parentData['parent_name'],
                        'email' => $parentData['parent_email'],
                        'username' => explode('@', $parentData['parent_email'])[0] . '_' . rand(100, 999),
                        'role_id' => (require(__DIR__ . '/../../config/roles.php'))['PARENT'],
                        'status' => 'active'
                    ];
                    if (!empty($parentData['parent_password'])) {
                        $newParentData['password'] = password_hash($parentData['parent_password'], PASSWORD_BCRYPT);
                    } else {
                        // default random password if not provided for new parent
                        $newParentData['password'] = password_hash('password123', PASSWORD_BCRYPT); 
                    }
                    $parentId = $this->userRepository->createUser($newParentData);
                }
            }

            if ($parentId) {
                // Remove existing links for this student just in case it's a replacement
                $db = \App\Core\Database::getInstance();
                $stmt = $db->prepare("DELETE FROM parent_student WHERE student_id = ?");
                $stmt->execute([$id]);

                $relationship = $parentData['relationship_type'] ?? 'guardian';
                $parentRepo->createParentStudentLink($parentId, $id, $relationship);
            }
        }

        return $result;
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
