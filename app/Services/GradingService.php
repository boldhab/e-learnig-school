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
        
        // Notify parents and send emails
        $db = \App\Core\Database::getInstance();
        $mailService = new \App\Services\MailService();
        $subject = "Grade Published: " . $submission['title'];

        // 1. Get student info and send email
        $studentStmt = $db->prepare("SELECT email, full_name FROM users WHERE id = ?");
        $studentStmt->execute([$submission['student_id']]);
        $studentInfo = $studentStmt->fetch(\PDO::FETCH_ASSOC);

        if ($studentInfo && !empty($studentInfo['email'])) {
            $studentBody = "Hello {$studentInfo['full_name']},\n\nYour grade for the assignment \"{$submission['title']}\" has been published.\nMarks: {$marks}/{$submission['max_marks']}\nFeedback: {$feedback}\n\nPlease check your portal for more details.\n\nThe Millennium School E-Learning System";
            try {
                $mailService->send($studentInfo['email'], $subject, $studentBody, $studentInfo['full_name']);
            } catch (Exception $e) {
                error_log("Grade email to student failed: " . $e->getMessage());
            }
        }

        // 2. Get parents info, notify in-app, and send email
        $parentStmt = $db->prepare("
            SELECT p.id, p.email, p.full_name 
            FROM parent_student ps 
            JOIN users p ON ps.parent_id = p.id 
            WHERE ps.student_id = ? AND p.status = 'active'
        ");
        $parentStmt->execute([$submission['student_id']]);
        $parentsInfo = $parentStmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($parentsInfo as $parent) {
            $this->notificationService->sendNotification(
                $parent['id'],
                $subject,
                "Your child received a grade for " . $submission['title'] . ": {$marks}/{$submission['max_marks']}",
                "grading",
                "medium"
            );

            if (!empty($parent['email'])) {
                $studentName = $studentInfo ? $studentInfo['full_name'] : 'your child';
                $parentBody = "Hello {$parent['full_name']},\n\n{$studentName} has received a grade for the assignment \"{$submission['title']}\".\nMarks: {$marks}/{$submission['max_marks']}\nFeedback: {$feedback}\n\nLog in to the parent portal for more details.\n\nThe Millennium School E-Learning System";
                try {
                    $mailService->send($parent['email'], $subject, $parentBody, $parent['full_name']);
                } catch (Exception $e) {
                    error_log("Grade email to parent failed: " . $e->getMessage());
                }
            }
        }

        return true;
    }

    public function publishGrades($submissionIds) {
        return $this->gradeRepository->publish($submissionIds);
    }
}
