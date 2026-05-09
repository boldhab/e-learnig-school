<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\CourseService;
use Exception;

class CourseController extends BaseController {
    protected $courseService;

    public function __construct() {
        $this->courseService = new CourseService();
    }

    public function list(Request $request, Response $response) {
        $this->requireAuth();
        $user = $GLOBALS['auth_user'];

        try {
            $courses = $this->courseService->getUserCourses(
                $user['id'],
                $user['role_name'],
                $user['class_id'] ?? null
            );
            $this->success($courses);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
