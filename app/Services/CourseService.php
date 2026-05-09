<?php

namespace App\Services;

use App\Repositories\CourseRepository;
use Exception;

class CourseService {
    protected $courseRepo;

    public function __construct() {
        $this->courseRepo = new CourseRepository();
    }

    public function getUserCourses($userId, $role, $classId = null) {
        if ($role === 'ADMIN') {
            return $this->courseRepo->getAllCourses();
        }

        if ($role === 'TEACHER') {
            return $this->courseRepo->getCoursesByTeacher($userId);
        }

        if ($role === 'STUDENT') {
            if (!$classId) {
                return [];
            }
            return $this->courseRepo->getCoursesByStudent($classId);
        }

        return [];
    }
}
