<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AttendanceService;
use App\Services\UserService;
use App\Helpers\HtmlSanitizer;
use Exception;

class AttendanceController extends BaseController {
    protected $attendanceService;
    protected $userService;

    public function __construct() {
        $this->attendanceService = new AttendanceService();
        $this->userService = new UserService();
    }

    public function bulkMark(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['teacher_id'] = $GLOBALS['auth_user']['id'];

        if (empty($data['course_id']) || empty($data['attendance_date']) || empty($data['records'])) {
            return $this->error('Missing required fields for bulk attendance', 422);
        }

        try {
            $this->attendanceService->bulkMarkAttendance($data);
            $this->success([], 'Attendance marked successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getCourseAttendance(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        $courseId = $request->getBody()['course_id'] ?? null;
        $date = $request->getBody()['date'] ?? date('Y-m-d');

        if (!$courseId) return $this->error('Course ID required', 400);

        try {
            $attendance = $this->attendanceService->getCourseAttendance($courseId, $date);
            $this->success($attendance);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getStudentAttendance(Request $request, Response $response) {
        $this->requireAuth();
        $user = $GLOBALS['auth_user'];
        $studentId = ($user['role_name'] === 'STUDENT') ? $user['id'] : ($request->getBody()['student_id'] ?? null);

        if (!$studentId) return $this->error('Student ID required', 400);

        try {
            $attendance = $this->attendanceService->getStudentAttendance($studentId);
            $this->success($attendance);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
