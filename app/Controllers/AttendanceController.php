<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AttendanceService;
use App\Services\AttendanceReportService;
use App\Services\UserService;
use App\Helpers\HtmlSanitizer;
use Exception;

class AttendanceController extends BaseController {
    protected $attendanceService;
    protected $reportService;
    protected $userService;

    public function __construct() {
        $this->attendanceService = new AttendanceService();
        $this->reportService = new AttendanceReportService();
        $this->userService = new UserService();
    }

    /**
     * POST /api/attendance/bulk
     * Body: { course_id, attendance_date, records: [{student_id, status, remarks}] }
     */
    public function bulkMark(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);

        $data = HtmlSanitizer::sanitize($request->getBody());
        $authUser = $GLOBALS['auth_user'] ?? [];
        $teacherId = (int)($authUser['id'] ?? $authUser['user_id'] ?? 0);
        $data['teacher_id'] = $teacherId;

        if (empty($data['course_id']) || empty($data['attendance_date']) || empty($data['records'])) {
            return $this->error('Missing required fields for bulk attendance', 422);
        }

        if (!is_array($data['records']) || count($data['records']) === 0) {
            return $this->error('Records array cannot be empty', 422);
        }

        // Verify teacher is assigned to this course (unless admin)
        $userRole = $authUser['role'] ?? null;
        if ($userRole !== 'ADMIN') {
            try {
                $this->attendanceService->validateTeacherCourseAssignment($teacherId, (int)$data['course_id']);
            } catch (Exception $e) {
                return $this->error('You are not assigned to this course', 403);
            }
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
        $studentId = (($user['role'] ?? null) === 'STUDENT')
            ? (int)($user['id'] ?? $user['user_id'] ?? 0)
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

    /**
     * GET /api/attendance/report/monthly?course_id=X&month=YYYY-MM
     * Returns monthly attendance report for a course.
     */
    public function getMonthlyReport(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);

        $courseId = $_GET['course_id'] ?? null;
        $month = $_GET['month'] ?? date('Y-m');

        if (!$courseId) {
            return $this->error('Course ID required', 400);
        }

        try {
            $report = $this->attendanceService->getMonthlyReport((int)$courseId, $month);
            $this->success($report);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /**
     * GET /api/attendance/summary?course_id=X
     * Returns attendance summary for a course.
     */
    public function getCourseSummary(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);

        $courseId = $_GET['course_id'] ?? null;

        if (!$courseId) {
            return $this->error('Course ID required', 400);
        }

        try {
            $summary = $this->attendanceService->getCourseSummary((int)$courseId);
            $this->success($summary);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /**
     * GET /api/attendance/analytics/course?course_id=X
     * Get detailed analytics for a course.
     */
    public function getCourseAnalytics(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);

        $courseId = $_GET['course_id'] ?? null;
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        if (!$courseId) {
            return $this->error('Course ID required', 400);
        }

        try {
            $analytics = $this->reportService->generateCourseAnalytics((int)$courseId, $startDate, $endDate);
            $this->success($analytics);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /**
     * GET /api/attendance/analytics/institution
     * Get institution-wide attendance analytics (admin only).
     */
    public function getInstitutionAnalytics(Request $request, Response $response) {
        $this->requireRole('ADMIN');

        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        try {
            $analytics = $this->reportService->generateInstitutionAnalytics($startDate, $endDate);
            $this->success($analytics);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /**
     * GET /api/attendance/insights?course_id=X
     * Get AI-powered insights and recommendations.
     */
    public function getInsights(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);

        $courseId = $_GET['course_id'] ?? null;
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        if (!$courseId) {
            return $this->error('Course ID required', 400);
        }

        try {
            $insights = $this->reportService->generateInsights((int)$courseId, $startDate, $endDate);
            $this->success($insights);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /**
     * GET /api/attendance/export/csv?course_id=X
     * Export attendance data as CSV.
     */
    public function exportCSV(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);

        $courseId = $_GET['course_id'] ?? null;
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        if (!$courseId) {
            return $this->error('Course ID required', 400);
        }

        try {
            $data = $this->reportService->prepareCSVData((int)$courseId, $startDate, $endDate);

            // Create CSV content
            $csv = "Full Name,Student Code,Email,Date,Status,Remarks\n";
            foreach ($data as $row) {
                $csv .= sprintf(
                    "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    $row['full_name'],
                    $row['student_code'],
                    $row['email'],
                    $row['attendance_date'],
                    $row['status'],
                    $row['remarks'] ?? ''
                );
            }

            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="attendance_report_' . date('Y-m-d') . '.csv"');
            echo $csv;
            exit;
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    /**
     * GET /api/attendance/student/{id}/history?course_id=X
     * Get a specific student's attendance history.
     */
    public function getStudentHistory(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);

        $studentId = (int)($_GET['student_id'] ?? 0);
        $courseId = $_GET['course_id'] ?? null;
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        if (!$studentId || !$courseId) {
            return $this->error('Student ID and Course ID required', 400);
        }

        try {
            $history = $this->reportService->getStudentAttendanceHistory($studentId, (int)$courseId, $startDate, $endDate);
            $this->success($history);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
