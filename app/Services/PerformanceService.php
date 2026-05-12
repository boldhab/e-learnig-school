<?php

namespace App\Services;

use App\Repositories\PerformanceRepository;
use App\Repositories\AttendanceRepository;
use Exception;

class PerformanceService {
    protected $performanceRepository;
    protected $attendanceRepository;
    protected $notificationService;

    public function __construct() {
        $this->performanceRepository = new PerformanceRepository();
        $this->attendanceRepository = new AttendanceRepository();
        $this->notificationService = new NotificationService();
    }

    public function generateReport(int $studentId, int $courseId): array {
        // Aggregate grades
        $grades = $this->performanceRepository->getAggregateGrades($studentId, $courseId);
        
        $totalEarned = 0;
        $totalMax = 0;
        
        foreach ($grades as $grade) {
            $totalEarned += $grade['marks'];
            $totalMax += $grade['max_marks'];
        }

        $assignmentAverage = $totalMax > 0 ? ($totalEarned / $totalMax) * 100 : 0.0;
        
        // Simplified for this implementation: assuming we pull these averages from DB or payload.
        // For testing purposes, if not present, we fallback to the general average.
        $quizAverage = $assignmentAverage; // In a full implementation, these would be filtered by assignment type
        $examAverage = $assignmentAverage;

        $attendancePercentage = $this->attendanceRepository->calculateAttendancePercentage($studentId, $courseId);

        // Overall score logic: Assignments 30%, Quizzes 30%, Exams 40%
        $overallScore = ($assignmentAverage * 0.3) + ($quizAverage * 0.3) + ($examAverage * 0.4);

        // Determine performance level
        if ($overallScore >= 85) {
            $performanceLevel = 'excellent';
        } elseif ($overallScore >= 70) {
            $performanceLevel = 'good';
        } elseif ($overallScore >= 50) {
            $performanceLevel = 'average';
        } else {
            $performanceLevel = 'poor';
        }

        $data = [
            'student_id' => $studentId,
            'course_id' => $courseId,
            'assignment_average' => $assignmentAverage,
            'quiz_average' => $quizAverage,
            'exam_average' => $examAverage,
            'attendance_percentage' => $attendancePercentage,
            'overall_score' => $overallScore,
            'performance_level' => $performanceLevel
        ];

        $reportId = $this->performanceRepository->generateReport($data);
        $data['id'] = $reportId;

        // Notification for poor performance
        if ($performanceLevel === 'poor') {
            $this->notificationService->sendNotification(
                $studentId,
                "Performance Alert",
                "Your academic performance is currently marked as poor. Please consult your teacher."
            );
        }

        return $data;
    }

    public function getStudentPerformance(int $studentId, ?int $courseId = null): array {
        return $this->performanceRepository->getStudentPerformance($studentId, $courseId);
    }

    public function getCoursePerformance(int $courseId): array {
        return $this->performanceRepository->getCoursePerformance($courseId);
    }

    public function getStudentDashboardSummary(int $studentId): array {
        $db = \App\Core\Database::getInstance();
        $stats = [];
        
        // 1. Average Grade (GPA equivalent)
        $performance = $this->getStudentPerformance($studentId);
        $totalScore = 0;
        foreach ($performance as $p) {
            $totalScore += $p['overall_score'];
        }
        $stats['avg_grade'] = count($performance) > 0 ? round($totalScore / count($performance), 1) : 0;
        
        // 2. Attendance Rate
        $attendanceSql = "SELECT 
                            COUNT(*) as total,
                            SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) as attended
                          FROM attendance_records WHERE student_id = :sid";
        $stmt = $db->prepare($attendanceSql);
        $stmt->execute(['sid' => $studentId]);
        $att = $stmt->fetch();
        $stats['attendance_rate'] = ($att && $att['total'] > 0) ? round(($att['attended'] / $att['total']) * 100, 1) : 0;
        
        // 3. Active Courses
        $courseSql = "SELECT COUNT(*) FROM teacher_assignments ta 
                      JOIN users u ON ta.class_id = u.class_id 
                      WHERE u.id = :sid";
        $stmt = $db->prepare($courseSql);
        $stmt->execute(['sid' => $studentId]);
        $stats['active_courses'] = (int)$stmt->fetchColumn();

        // 4. Pending Assignments
        $assignSql = "SELECT COUNT(*) FROM assignments a
                      JOIN teacher_assignments ta ON a.course_id = ta.course_id
                      JOIN users u ON ta.class_id = u.class_id
                      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = u.id
                      WHERE u.id = :sid AND s.id IS NULL";
        $stmt = $db->prepare($assignSql);
        $stmt->execute(['sid' => $studentId]);
        $stats['pending_assignments'] = (int)$stmt->fetchColumn();
        
        // 5. Latest Announcement (Upcoming Event)
        $annSql = "SELECT title, message, created_at FROM announcements 
                   WHERE (target_role = 'all' OR target_role = 'student') 
                   AND is_active = 1 
                   ORDER BY created_at DESC LIMIT 1";
        $stats['upcoming_event'] = $db->query($annSql)->fetch(\PDO::FETCH_ASSOC) ?: null;

        return $stats;
    }
}
