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
}
