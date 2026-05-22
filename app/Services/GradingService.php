<?php

namespace App\Services;

use App\Repositories\GradeRepository;
use App\Repositories\SubmissionRepository;
use Exception;

class GradingService {
    protected $gradeRepository;
    protected $submissionRepository;
    protected $notificationService;

    public function __construct() {
        $this->gradeRepository = new GradeRepository();
        $this->submissionRepository = new SubmissionRepository();
        $this->notificationService = new NotificationService();
    }

    public function gradeSubmission($submissionId, $marks, $feedback, $gradedBy) {
        $submission = $this->submissionRepository->findById($submissionId);
        if (!$submission) {
            throw new Exception("Submission not found");
        }

        if ($marks > $submission['max_marks']) {
            throw new Exception("Marks cannot exceed maximum marks ({$submission['max_marks']})");
        }

        $data = [
            'submission_id' => $submissionId,
            'marks' => $marks,
            'feedback' => $feedback,
            'graded_by' => $gradedBy
        ];

        $this->gradeRepository->save($data);
        $this->submissionRepository->updateStatus($submissionId, 'graded');
        
        // Notify student immediately on grading
        $this->notificationService->notifyGradePublished($submission['student_id'], $submissionId, $submission['title']);
        
        // Notify parents
        $db = \App\Core\Database::getInstance();
        $parentStmt = $db->prepare("SELECT parent_id FROM parent_student WHERE student_id = ?");
        $parentStmt->execute([$submission['student_id']]);
        $parentIds = $parentStmt->fetchAll(\PDO::FETCH_COLUMN);
        foreach ($parentIds as $pid) {
            $this->notificationService->sendNotification(
                $pid,
                "Grade Published: " . $submission['title'],
                "Your child received a grade for " . $submission['title'] . ": {$marks}/{$submission['max_marks']}",
                "grading",
                "medium"
            );
        }

        return true;
    }

    public function publishGrades($submissionIds) {
        return $this->gradeRepository->publish($submissionIds);
    }
}
