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

    public function getSchoolStats() {
        $db = \App\Core\Database::getInstance();
        
        $stats = [];
        $stats['total_users'] = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $stats['total_students'] = $db->query("SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.role_name = 'STUDENT'")->fetchColumn();
        $stats['total_teachers'] = $db->query("SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.role_name = 'TEACHER'")->fetchColumn();
        $stats['total_courses'] = $db->query("SELECT COUNT(*) FROM categories WHERE type = 'Subject'")->fetchColumn();
        $stats['active_discussions'] = $db->query("SELECT COUNT(*) FROM discussion_groups")->fetchColumn();
        
        return $stats;
    }

    public function getRecentLogs() {
        $db = \App\Core\Database::getInstance();
        
        $logs = [];
        
        // New Users
        $newUsers = $db->query("
            SELECT 'USER' as type, CONCAT('New user registered: ', full_name) as msg, created_at as time, 'blue' as color 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 5
        ")->fetchAll();
        
        // Logins (if table exists, otherwise just return users for now)
        try {
            $logins = $db->query("
                SELECT 'SECURITY' as type, CONCAT('User login: ', u.username) as msg, l.created_at as time, 'purple' as color 
                FROM login_logs l
                JOIN users u ON l.user_id = u.id
                ORDER BY l.created_at DESC 
                LIMIT 5
            ")->fetchAll();
            $logs = array_merge($newUsers, $logins);
        } catch (\Exception $e) {
            $logs = $newUsers;
        }

        // Sort by time
        usort($logs, function($a, $b) {
            return strtotime($b['time']) - strtotime($a['time']);
        });

        return array_slice($logs, 0, 10);
    }
}
