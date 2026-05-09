<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AttendanceService;
use App\Helpers\HtmlSanitizer;
use Exception;

class AttendanceController extends BaseController {
    protected $attendanceService;

    public function __construct() {
        $this->attendanceService = new AttendanceService();
    }

    public function mark(Request $request, Response $response) {
        $this->requireRole('TEACHER');
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['teacher_id'] = $GLOBALS['auth_user']['id'];
        
        try {
            $result = $this->attendanceService->markAttendance($data);
            $this->success($result, 'Attendance marked successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getByStudent(Request $request, Response $response, $id) {
        $this->requireRole(['STUDENT', 'TEACHER', 'ADMIN']);
        
        // Basic check: Student can only view their own attendance
        $currentUser = $GLOBALS['auth_user'];
        if ($currentUser['role_id'] == 3 && $currentUser['id'] != $id) {
            $this->error('Forbidden: You can only view your own attendance', 403);
        }

        $params = $request->getBody();
        $courseId = $params['course_id'] ?? null;
        
        try {
            $records = $this->attendanceService->getStudentAttendance($id, $courseId);
            $this->success($records, 'Student attendance records retrieved');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getByCourse(Request $request, Response $response, $id) {
        $this->requireRole(['TEACHER', 'ADMIN']);
        
        $params = $request->getBody();
        if (empty($params['date'])) {
            $this->error('Date is required to view course attendance', 400);
        }

        try {
            $records = $this->attendanceService->getCourseAttendance($id, $params['date']);
            $this->success($records, 'Course attendance records retrieved');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getMonthlyReport(Request $request, Response $response) {
        $this->requireRole(['TEACHER', 'ADMIN']);
        // Monthly report aggregation logic would go here.
        // For simplicity, returning a success message as a placeholder.
        $this->success([], 'Monthly report generation successful');
    }
}
