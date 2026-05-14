<?php

namespace App\Services;

use App\Repositories\GapAnalysisRepository;
use App\Repositories\PerformanceRepository;
use App\Repositories\AttendanceRepository;
use Exception;

class GapAnalysisService {
    protected $gapAnalysisRepository;
    protected $performanceRepository;
    protected $attendanceRepository;
    protected $notificationService;

    public function __construct() {
        $this->gapAnalysisRepository = new GapAnalysisRepository();
        $this->performanceRepository = new PerformanceRepository();
        $this->attendanceRepository = new AttendanceRepository();
        $this->notificationService = new NotificationService();
    }

    public function generateAnalysis(int $studentId, int $courseId, int $generatedBy): array {
        // We need overall performance score and attendance percentage
        // Instead of calculating from scratch, we can look for the latest performance report,
        // or recalculate to be safe. We will use the calculate Attendance and average grades directly here or rely on latest performance.
        
        $attendancePercentage = $this->attendanceRepository->calculateAttendancePercentage($studentId, $courseId);
        
        $grades = $this->performanceRepository->getAggregateGrades($studentId, $courseId);
        $totalEarned = 0;
        $totalMax = 0;
        foreach ($grades as $grade) {
            $totalEarned += $grade['marks'];
            $totalMax += $grade['max_marks'];
        }
        $overallScore = $totalMax > 0 ? ($totalEarned / $totalMax) * 100 : 0.0;

        // Determine risk level based on score AND attendance
        $riskLevel = 'low';
        if ($overallScore < 50 || $attendancePercentage < 40) {
            $riskLevel = 'high';
        } elseif ($overallScore < 65 || $attendancePercentage < 60) {
            $riskLevel = 'medium';
        }

        // Improvement Recommendations based on specific gaps
        if ($riskLevel === 'high') {
            $recommendations = $attendancePercentage < 40 
                ? 'CRITICAL: Absenteeism is severely impacting learning. Immediate parent-teacher meeting required.'
                : 'Immediate intervention required. Mandatory counseling and remedial classes.';
            $weakTopics = 'Requires fundamental review across all recent topics.';
        } elseif ($riskLevel === 'medium') {
            $recommendations = $attendancePercentage < 60
                ? 'Attendance needs to stabilize. Student is missing key conceptual lessons.'
                : 'Needs to focus on practice assignments and consistent participation.';
            $weakTopics = 'Inconsistent performance in recent chapters.';
        } else {
            $recommendations = 'Keep up the good work. Try advanced assignments.';
            $weakTopics = 'No major weaknesses detected.';
        }

        $data = [
            'student_id' => $studentId,
            'course_id' => $courseId,
            'weak_topics' => $weakTopics,
            'improvement_recommendations' => $recommendations,
            'risk_level' => $riskLevel,
            'attendance_percentage' => round($attendancePercentage, 2),
            'overall_score' => round($overallScore, 2),
            'generated_by' => $generatedBy
        ];

        $analysisId = $this->gapAnalysisRepository->createAnalysis($data);
        $data['id'] = $analysisId;

        // Alert Admin/Teacher and Student if high risk
        if ($riskLevel === 'high') {
            $this->notificationService->sendNotification(
                $studentId,
                "Academic Risk Warning",
                "You have been identified as High Risk in course ID {$courseId}. Please speak with your teacher immediately."
            );
        }

        return $data;
    }

    public function getStudentAnalysis(int $studentId, ?int $courseId = null): array {
        return $this->gapAnalysisRepository->getStudentAnalysis($studentId, $courseId);
    }

    public function getHighRiskStudents(): array {
        return $this->gapAnalysisRepository->getHighRiskStudents();
    }
}
