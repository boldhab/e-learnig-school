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
            $this->success(['user_id' => $id], 'Student created successfully', 201);
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
            $this->success(['user_id' => $id], 'Teacher created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getAllUsers(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $users = $this->userService->getAllUsers();
        $response->json($users);
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
}
