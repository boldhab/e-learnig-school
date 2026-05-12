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

    /**
     * POST /api/attendance/bulk
     * Body: { course_id, attendance_date, records: [{student_id, status, remarks}] }
     */
    public function bulkMark(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);

        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['teacher_id'] = $GLOBALS['auth_user']['id'];

        if (empty($data['course_id']) || empty($data['attendance_date']) || empty($data['records'])) {
            return $this->error('Missing required fields for bulk attendance', 422);
        }

        if (!is_array($data['records']) || count($data['records']) === 0) {
            return $this->error('Records array cannot be empty', 422);
        }

        try {
            $result = $this->attendanceService->bulkMarkAttendance($data);
            $message = "Attendance marked successfully for {$result['success_count']} out of {$result['total_records']} students";
            
            if (!empty($result['errors'])) {
                $message .= ". Some records had errors: " . implode('; ', array_slice($result['errors'], 0, 3));
                if (count($result['errors']) > 3) {
                    $message .= " and " . (count($result['errors']) - 3) . " more errors";
                }
            }
            
            $this->success($result, $message);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /**
     * GET /api/attendance/course?course_id=X&date=Y
     * Returns all attendance records for a given course and date.
     */
    public function getCourseAttendance(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);

        // GET request — read from query string
        $courseId = $_GET['course_id'] ?? null;
        $date     = $_GET['date']      ?? date('Y-m-d');

        if (!$courseId) {
            return $this->error('Course ID required', 400);
        }

        try {
            $attendance = $this->attendanceService->getCourseAttendance((int)$courseId, $date);
            $this->success($attendance);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /**
     * GET /api/attendance/student
     * Returns the authenticated student's attendance records + summary.
     */
    public function getStudentAttendance(Request $request, Response $response) {
        $this->requireAuth();
        $user = $GLOBALS['auth_user'];

        // Students can only see their own; admins/teachers can pass student_id
        $studentId = ($user['role_name'] === 'STUDENT')
            ? (int)$user['id']
            : (int)($_GET['student_id'] ?? 0);

        if (!$studentId) {
            return $this->error('Student ID required', 400);
        }

        try {
            $records = $this->attendanceService->getStudentAttendance($studentId);
            $summary = $this->attendanceService->getStudentAttendanceSummary($studentId);

            $this->success([
                'records' => $records,
                'summary' => $summary,
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
