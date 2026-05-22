<?php

namespace App\Services;

use App\Repositories\GapAnalysisRepository;
use App\Repositories\PerformanceRepository;
use App\Repositories\AttendanceRepository;
use App\Services\NotificationService;
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
        $attendancePercentage = $this->attendanceRepository->calculateAttendancePercentage($studentId, $courseId);
        
        $grades = $this->performanceRepository->getAggregateGrades($studentId, $courseId);
        $totalEarned = 0;
        $totalMax = 0;
        $weakAssignments = [];
        
        foreach ($grades as $grade) {
            $totalEarned += $grade['marks'];
            $totalMax += $grade['max_marks'];
            
            // Check if student scored less than 65% on this assignment
            $percentage = $grade['max_marks'] > 0 ? ($grade['marks'] / $grade['max_marks']) * 100 : 0.0;
            if ($percentage < 65) {
                $weakAssignments[] = $grade['assignment_title'];
            }
        }
        
        $overallScore = $totalMax > 0 ? ($totalEarned / $totalMax) * 100 : 0.0;
        
        $unsubmitted = $this->performanceRepository->getUnsubmittedAssignments($studentId, $courseId);
        $unsubmittedTitles = array_column($unsubmitted, 'title');

        // Determine risk level based on score, attendance, and missing submissions
        $riskLevel = 'low';
        if ($overallScore < 50 || $attendancePercentage < 40 || count($unsubmittedTitles) > 2) {
            $riskLevel = 'high';
        } elseif ($overallScore < 65 || $attendancePercentage < 75 || count($unsubmittedTitles) > 0) {
            $riskLevel = 'medium';
        }

        // Build weak topics dynamically
        $weakParts = [];
        if (!empty($weakAssignments)) {
            $weakParts[] = "Low grades in: " . implode(', ', $weakAssignments);
        }
        if (!empty($unsubmittedTitles)) {
            $weakParts[] = "Missing submissions: " . implode(', ', $unsubmittedTitles);
        }
        
        if (!empty($weakParts)) {
            $weakTopics = implode(". ", $weakParts);
        } else {
            if ($overallScore > 0 && $overallScore < 70) {
                $weakTopics = "General conceptual gaps across course topics.";
            } else {
                $weakTopics = "No major weaknesses detected. Performing well.";
            }
        }

        // Build improvement recommendations dynamically
        $recommendationParts = [];
        if ($attendancePercentage < 75) {
            $recommendationParts[] = "Improve class attendance (currently " . round($attendancePercentage, 1) . "%). Attend all lectures and interactive discussions.";
        }
        if (!empty($unsubmittedTitles)) {
            $recommendationParts[] = "Submit outstanding assignments (" . implode(', ', $unsubmittedTitles) . ") as soon as possible.";
        }
        if (!empty($weakAssignments)) {
            $recommendationParts[] = "Review feedback and concepts for poorly performed assignments (" . implode(', ', $weakAssignments) . ").";
        }
        if ($overallScore < 60) {
            $recommendationParts[] = "Schedule study hours and seek assistance from the teacher or tutor.";
        }

        if (empty($recommendationParts)) {
            $recommendations = "Keep up the excellent work! Continue participating actively in class and assignments.";
        } else {
            $recommendations = implode(" ", $recommendationParts);
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
                "You have been identified as High Risk in course ID {$courseId}. Please speak with your teacher immediately.",
                "performance",
                "high"
            );
            
            // Notify parents
            $db = \App\Core\Database::getInstance();
            $parentStmt = $db->prepare("SELECT parent_id FROM parent_student WHERE student_id = ?");
            $parentStmt->execute([$studentId]);
            $parentIds = $parentStmt->fetchAll(\PDO::FETCH_COLUMN);
            foreach ($parentIds as $pid) {
                $this->notificationService->sendNotification(
                    $pid,
                    "Academic Risk Warning: Your Child",
                    "Your child has been identified as High Risk in course ID {$courseId}. Please review their performance.",
                    "performance",
                    "high"
                );
            }
        }

        return $data;
    }

    public function getStudentAnalysis(int $studentId, ?int $courseId = null, int $generatedBy = 1): array {
        if ($courseId) {
            try {
                $this->generateAnalysis($studentId, (int)$courseId, $generatedBy);
            } catch (Exception $e) {
                error_log("Failed to auto-generate analysis on getStudentAnalysis: " . $e->getMessage());
            }
        }
        return $this->gapAnalysisRepository->getStudentAnalysis($studentId, $courseId);
    }

    public function getHighRiskStudents(): array {
        return $this->gapAnalysisRepository->getHighRiskStudents();
    }
}
