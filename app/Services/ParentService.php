<?php

namespace App\Services;

use App\Repositories\ParentRepository;
use App\Services\AttendanceService;
use App\Services\PerformanceService;
use App\Services\GapAnalysisService;
use App\Core\Database;
use Exception;

class ParentService {
    protected $parentRepository;
    protected $attendanceService;
    protected $performanceService;
    protected $gapAnalysisService;
    protected $db;

    public function __construct() {
        $this->parentRepository = new ParentRepository();
        $this->attendanceService = new AttendanceService();
        $this->performanceService = new PerformanceService();
        $this->gapAnalysisService = new GapAnalysisService();
        $this->db = Database::getInstance();
    }

    public function getChildren(int $parentId): array {
        return $this->parentRepository->getLinkedChildren($parentId);
    }

    public function verifyLink(int $parentId, int $studentId): void {
        if (!$this->parentRepository->verifyParentChildLink($parentId, $studentId)) {
            throw new Exception("Unauthorized: You do not have access to this student's records.", 403);
        }
    }

    public function getChildAttendance(int $parentId, int $studentId): array {
        $this->verifyLink($parentId, $studentId);
        $records = $this->attendanceService->getStudentAttendance($studentId);
        $summary = $this->attendanceService->getStudentAttendanceSummary($studentId);
        $monthly = $this->parentRepository->getAttendanceMonthlyBreakdown($studentId);
        $weeklyTrend = $this->parentRepository->getAttendanceLateArrivalTrend($studentId);
        return [
            'child' => $this->parentRepository->getChildProfile($studentId),
            'records' => $records,
            'summary' => $summary,
            'monthly_breakdown' => $monthly,
            'weekly_trend' => $weeklyTrend,
            'alerts' => $this->buildAttendanceAlerts($summary, $weeklyTrend)
        ];
    }

    public function getChildPerformance(int $parentId, int $studentId): array {
        $this->verifyLink($parentId, $studentId);
        $reports = $this->performanceService->getStudentPerformance($studentId);
        $courses = $this->parentRepository->getStudentCourses($studentId);
        $assignments = $this->parentRepository->getStudentAssignments($studentId);

        return [
            'child' => $this->parentRepository->getChildProfile($studentId),
            'reports' => $reports,
            'summary' => $this->buildAcademicSummary($reports, $courses, $assignments),
            'course_averages' => array_values(array_map(function ($course) {
                return [
                    'course_name' => $course['course_name'],
                    'average_percentage' => (float) ($course['average_grade'] ?? 0),
                ];
            }, $courses)),
            'recent_submissions' => array_slice(array_values(array_filter($assignments, function ($assignment) {
                return !empty($assignment['submission_id']);
            })), 0, 8),
        ];
    }

    public function getChildRiskReport(int $parentId, int $studentId): array {
        $this->verifyLink($parentId, $studentId);
        try {
            $analysis = $this->gapAnalysisService->getStudentAnalysis($studentId);
        } catch (Exception $e) {
            $analysis = [];
        }
        return $analysis;
    }

    public function getChildOverview(int $parentId, int $studentId): array {
        $this->verifyLink($parentId, $studentId);

        $child = $this->parentRepository->getChildProfile($studentId);
        $courses = $this->parentRepository->getStudentCourses($studentId);
        $assignments = $this->parentRepository->getStudentAssignments($studentId);
        $attendance = $this->attendanceService->getStudentAttendanceSummary($studentId);
        $performance = $this->performanceService->getStudentPerformance($studentId);
        $notifications = $this->parentRepository->getRecentNotifications($parentId, 8);
        $riskReport = $this->getChildRiskReport($parentId, $studentId);

        $metrics = [
            'active_courses' => count($courses),
            'average_grade' => $this->calculateAverageGrade($courses, $performance),
            'attendance_percentage' => (float) ($attendance['overall']['percentage'] ?? 0),
            'pending_assignments' => count(array_filter($assignments, fn ($item) => ($item['parent_status'] ?? '') === 'pending')),
            'missing_assignments' => count(array_filter($assignments, fn ($item) => ($item['parent_status'] ?? '') === 'missing')),
            'graded_assignments' => count(array_filter($assignments, fn ($item) => ($item['parent_status'] ?? '') === 'graded')),
        ];

        return [
            'child' => $child,
            'metrics' => $metrics,
            'courses' => array_slice($courses, 0, 6),
            'assignments' => array_slice($assignments, 0, 8),
            'attendance' => $attendance,
            'alerts' => $this->buildParentAlerts($assignments, $attendance, $riskReport, $notifications),
            'notifications' => $notifications,
            'risk_report' => $riskReport,
        ];
    }

    public function getChildCourses(int $parentId, int $studentId): array {
        $this->verifyLink($parentId, $studentId);

        return [
            'child' => $this->parentRepository->getChildProfile($studentId),
            'courses' => $this->parentRepository->getStudentCourses($studentId),
        ];
    }

    public function getChildAssignments(int $parentId, int $studentId): array {
        $this->verifyLink($parentId, $studentId);

        $assignments = $this->parentRepository->getStudentAssignments($studentId);
        $statusCounts = [
            'pending' => 0,
            'submitted' => 0,
            'late' => 0,
            'missing' => 0,
            'graded' => 0,
        ];

        foreach ($assignments as $assignment) {
            $status = strtolower((string) ($assignment['parent_status'] ?? 'pending'));
            if (isset($statusCounts[$status])) {
                $statusCounts[$status]++;
            }
        }

        return [
            'child' => $this->parentRepository->getChildProfile($studentId),
            'summary' => $statusCounts,
            'assignments' => $assignments,
        ];
    }

    public function getChildReports(int $parentId, int $studentId): array {
        $this->verifyLink($parentId, $studentId);

        $child = $this->parentRepository->getChildProfile($studentId);
        $attendance = $this->getChildAttendance($parentId, $studentId);
        $performance = $this->getChildPerformance($parentId, $studentId);
        $courses = $this->parentRepository->getStudentCourses($studentId);
        $gradeRows = $this->parentRepository->getStudentGradeReportRows($studentId);
        $performanceReports = $this->parentRepository->getStudentPerformanceReports($studentId);
        $recentAttendance = $this->parentRepository->getStudentRecentAttendanceRows($studentId, 20);

        return [
            'child' => $child,
            'academic_report' => array_merge($performance['summary'], [
                'grade_rows' => $gradeRows,
                'performance_reports' => $performanceReports,
                'graded_assignments' => count(array_filter($gradeRows, fn ($item) => ($item['report_status'] ?? '') === 'graded')),
                'missing_assignments' => count(array_filter($gradeRows, fn ($item) => ($item['report_status'] ?? '') === 'missing')),
                'submitted_assignments' => count(array_filter($gradeRows, fn ($item) => in_array(($item['report_status'] ?? ''), ['submitted', 'late', 'graded'], true))),
            ]),
            'attendance_report' => [
                'overall' => $attendance['summary']['overall'] ?? [],
                'by_course' => $attendance['summary']['by_course'] ?? [],
                'monthly_breakdown' => $attendance['monthly_breakdown'] ?? [],
                'recent_records' => $recentAttendance,
                'alerts' => $attendance['alerts'] ?? [],
            ],
            'courses' => $courses,
            'generated_reports' => $performanceReports,
        ];
    }

    protected function calculateAverageGrade(array $courses, array $reports): float {
        $grades = array_values(array_filter(array_map(function ($course) {
            return isset($course['average_grade']) ? (float) $course['average_grade'] : null;
        }, $courses), fn ($value) => $value !== null && $value > 0));

        if (!empty($grades)) {
            return round(array_sum($grades) / count($grades), 1);
        }

        $scores = array_values(array_filter(array_map(function ($report) {
            return isset($report['overall_score']) ? (float) $report['overall_score'] : null;
        }, $reports), fn ($value) => $value !== null));

        return !empty($scores) ? round(array_sum($scores) / count($scores), 1) : 0.0;
    }

    protected function buildAcademicSummary(array $reports, array $courses, array $assignments): array {
        $avgGrade = $this->calculateAverageGrade($courses, $reports);
        $gradedAssignments = array_filter($assignments, fn ($item) => ($item['parent_status'] ?? '') === 'graded');

        return [
            'gpa' => round($avgGrade / 25, 2),
            'average_grade' => $avgGrade,
            'subject_averages' => array_values(array_map(function ($course) {
                return [
                    'course_name' => $course['course_name'],
                    'teacher_name' => $course['teacher_name'],
                    'average_grade' => $course['average_grade'] !== null ? (float) $course['average_grade'] : null,
                    'graded_total' => (int) ($course['graded_total'] ?? 0),
                    'progress_percentage' => (float) ($course['assignments_total'] > 0
                        ? round(((int) $course['submissions_total'] / (int) $course['assignments_total']) * 100, 1)
                        : 0),
                ];
            }, $courses)),
            'graded_count' => count($gradedAssignments),
            'report_count' => count($reports),
        ];
    }

    protected function buildAttendanceAlerts(array $summary, array $weeklyTrend): array {
        $alerts = [];
        $overall = $summary['overall'] ?? [];
        $percentage = (float) ($overall['percentage'] ?? 0);
        $lateCount = (int) ($overall['late'] ?? 0);
        $absentCount = (int) ($overall['absent'] ?? 0);

        if ($percentage > 0 && $percentage < 75) {
            $alerts[] = "Attendance below 75%";
        }
        if ($absentCount > 0) {
            $alerts[] = "{$absentCount} total absences recorded";
        }
        if (!empty($weeklyTrend)) {
            $latest = $weeklyTrend[0];
            if ((int) ($latest['late_count'] ?? 0) >= 3) {
                $alerts[] = "3 late arrivals this week";
            }
        } elseif ($lateCount >= 3) {
            $alerts[] = "3 or more late arrivals recorded";
        }

        return $alerts;
    }

    protected function buildParentAlerts(array $assignments, array $attendance, array $riskReport, array $notifications): array {
        $alerts = [];

        foreach ($assignments as $assignment) {
            $status = strtolower((string) ($assignment['parent_status'] ?? ''));
            if ($status === 'missing') {
                $alerts[] = "Assignment overdue: " . $assignment['title'];
            } elseif ($status === 'graded') {
                $alerts[] = "Assignment graded: " . $assignment['title'];
            }
        }

        $attendanceAlerts = $this->buildAttendanceAlerts($attendance, []);
        foreach ($attendanceAlerts as $alert) {
            $alerts[] = $alert;
        }

        if (!empty($riskReport['risk_level']) && strtolower((string) $riskReport['risk_level']) !== 'low') {
            $alerts[] = "Performance declining / at-risk alert";
        }

        foreach ($notifications as $notification) {
            if (count($alerts) >= 8) {
                break;
            }
            $alerts[] = $notification['title'];
        }

        return array_values(array_unique(array_slice($alerts, 0, 8)));
    }
}
