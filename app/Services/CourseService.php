<?php

namespace App\Services;

use App\Repositories\CourseRepository;
use Exception;

class CourseService {
    protected $courseRepo;

    public function __construct() {
        $this->courseRepo = new CourseRepository();
    }

    public function getUserCourses($userId, $role) {
        if ($role === 'ADMIN') return $this->courseRepo->getAll();
        if ($role === 'TEACHER') return $this->courseRepo->getCoursesByTeacher($userId);
        if ($role === 'STUDENT') {
            $user = (new \App\Repositories\UserRepository())->findById($userId);
            return $this->courseRepo->getCoursesByStudent($user['class_id']);
        }
        return [];
    }

    public function getCourseStudents(int $courseId, ?int $classId = null): array {
        return $this->courseRepo->getStudentsByCourse($courseId, $classId);
    }
}
