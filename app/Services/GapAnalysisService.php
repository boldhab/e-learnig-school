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

        // Determine Risk Level
        /*
        HIGH RISK: Attendance < 60% OR Score < 50%
        MEDIUM RISK: Attendance 60–75% OR Score 50–65%
        LOW RISK: Attendance > 75% AND Score > 65%
        */

        if ($attendancePercentage < 60 || $overallScore < 50) {
            $riskLevel = 'high';
            $recommendations = 'Immediate intervention required. Mandatory counseling and remedial classes.';
            $weakTopics = 'Requires fundamental review across all recent topics.';
        } elseif (($attendancePercentage >= 60 && $attendancePercentage <= 75) || ($overallScore >= 50 && $overallScore <= 65)) {
            $riskLevel = 'medium';
            $recommendations = 'Needs to improve attendance and focus on practice assignments.';
            $weakTopics = 'Inconsistent performance in recent chapters.';
        } else {
            $riskLevel = 'low';
            $recommendations = 'Keep up the good work. Try advanced assignments.';
            $weakTopics = 'No major weaknesses detected.';
        }

        $data = [
            'student_id' => $studentId,
            'course_id' => $courseId,
            'weak_topics' => $weakTopics,
            'improvement_recommendations' => $recommendations,
            'risk_level' => $riskLevel,
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
