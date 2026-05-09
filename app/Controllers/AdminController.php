<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\UserService;
use App\Services\AdminService;
use App\Core\Validation;
use App\Helpers\HtmlSanitizer;
use Exception;

class AdminController extends BaseController {
    protected $userService;
    protected $adminService;
    protected $validation;

    public function __construct() {
        $this->userService = new UserService();
        $this->adminService = new AdminService();
        $this->validation = new Validation();
    }

    public function createStudent(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        if (!$this->validation->validate($data, [
            'full_name' => 'required',
            'username' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6'
        ])) {
            $this->error('Validation failed', 422, $this->validation->getErrors());
        }

        try {
            $id = $this->userService->createStudent($data);
            if (!empty($data['class_id'])) {
                $this->adminService->assignStudentToClass($id, $data['class_id']);
            }
            $this->success(['user_id' => $id], 'Student created and assigned successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function createTeacher(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        if (!$this->validation->validate($data, [
            'full_name' => 'required',
            'username' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6'
        ])) {
            $this->error('Validation failed', 422, $this->validation->getErrors());
        }

        try {
            $id = $this->userService->createTeacher($data);
            if (!empty($data['course_id']) && !empty($data['class_id'])) {
                $this->adminService->assignTeacherToCourse($id, $data['course_id'], $data['class_id']);
            }
            $this->success(['user_id' => $id], 'Teacher created and assigned successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getAllUsers(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $users = $this->userService->getAllUsers();
        $this->success($users);
    }

    public function updateUser(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        if (empty($data['id'])) $this->error('ID is required');
        
        try {
            $id = $data['id'];
            unset($data['id']); // Don't update ID
            $this->userService->updateUser($id, $data);
            $this->success([], 'User updated successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function deleteUser(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = $request->getBody();
        if (empty($data['id'])) $this->error('ID is required');
        
        try {
            $db = \App\Core\Database::getInstance();
            $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$data['id']]);
            $this->success([], 'User deleted successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function resetPassword(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = $request->getBody();
        if (empty($data['id']) || empty($data['password'])) {
            $this->error('ID and new password are required', 422);
        }
        
        try {
            $this->userService->updateUser($data['id'], ['password' => $data['password']]);
            $this->success([], 'Password reset successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function changeUserStatus(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        if (!isset($data['id']) || !isset($data['status'])) {
            $this->error('ID and status are required', 422);
        }

        try {
            $this->userService->updateUser($data['id'], ['status' => $data['status']]);
            $this->success([], 'User status updated successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function assignStudent(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        if (empty($data['student_id']) || empty($data['class_id'])) {
            $this->error('Student ID and Class ID are required', 422);
        }
        try {
            $this->adminService->assignStudentToClass($data['student_id'], $data['class_id']);
            $this->success([], 'Student assigned to class successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function assignTeacher(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        if (empty($data['teacher_id']) || empty($data['course_id']) || empty($data['class_id'])) {
            $this->error('Teacher ID, Course ID, and Class ID are required', 422);
        }
        try {
            $this->adminService->assignTeacherToCourse($data['teacher_id'], $data['course_id'], $data['class_id']);
            $this->success([], 'Teacher assigned to course and class successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getTeacherAssignments(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');
        $assignments = $this->adminService->getTeacherAssignments($id);
        $this->success($assignments);
    }

    public function getStats(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        try {
            $stats = $this->adminService->getSchoolStats();
            $this->success($stats);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getLogs(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        try {
            $logs = $this->adminService->getRecentLogs();
            $this->success($logs);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getClasses(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        try {
            $db = \App\Core\Database::getInstance();
            $classes = $db->query("SELECT id, name FROM categories WHERE type = 'Grade'")->fetchAll();
            $this->success($classes);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getCourses(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        try {
            $db = \App\Core\Database::getInstance();
            $courses = $db->query("SELECT id, name FROM categories WHERE type = 'Course' OR type = 'Subject'")->fetchAll();
            $this->success($courses);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
