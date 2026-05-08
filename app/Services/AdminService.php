<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Repositories\TeacherAssignmentRepository;
use Exception;

class AdminService {
    protected $userRepository;
    protected $teacherAssignmentRepo;

    public function __construct() {
        $this->userRepository = new UserRepository();
        $this->teacherAssignmentRepo = new TeacherAssignmentRepository();
    }

    public function assignStudentToClass($studentId, $classId) {
        $user = $this->userRepository->findById($studentId);
        if (!$user || $user['role_name'] !== 'STUDENT') {
            throw new Exception("Invalid student ID.");
        }
        return $this->userRepository->assignToClass($studentId, $classId);
    }

    public function assignTeacherToCourse($teacherId, $courseId, $classId) {
        $user = $this->userRepository->findById($teacherId);
        if (!$user || $user['role_name'] !== 'TEACHER') {
            throw new Exception("Invalid teacher ID.");
        }
        return $this->teacherAssignmentRepo->assign($teacherId, $courseId, $classId);
    }

    public function getTeacherAssignments($teacherId) {
        return $this->teacherAssignmentRepo->getByTeacher($teacherId);
    }

    public function removeTeacherAssignment($assignmentId) {
        return $this->teacherAssignmentRepo->removeAssignment($assignmentId);
    }
}
