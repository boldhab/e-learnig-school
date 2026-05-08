<?php

namespace App\Services;

use App\Repositories\SubmissionRepository;
use App\Repositories\AssignmentRepository;
use App\Helpers\CloudinaryHelper;
use Exception;

class SubmissionService {
    protected $submissionRepository;
    protected $assignmentRepository;
    protected $cloudinaryHelper;

    public function __construct() {
        $this->submissionRepository = new SubmissionRepository();
        $this->assignmentRepository = new AssignmentRepository();
        $this->cloudinaryHelper = new CloudinaryHelper();
    }

    public function submitAssignment($assignmentId, $studentId, $data, $file = null) {
        $assignment = $this->assignmentRepository->findById($assignmentId);
        if (!$assignment) {
            throw new Exception("Assignment not found");
        }

        // Check deadline
        $dueDate = strtotime($assignment['due_date']);
        $now = time();
        $status = ($now > $dueDate) ? 'late' : 'pending';

        if ($file && $file['size'] > 0) {
            $cloudinaryResult = $this->cloudinaryHelper->upload($file['tmp_name'], 'auto', [
                'folder' => 'millennium/submissions'
            ]);

            if (isset($cloudinaryResult['secure_url'])) {
                $data['submission_file_url'] = $cloudinaryResult['secure_url'];
                $data['submission_file_public_id'] = $cloudinaryResult['public_id'];
            }
        }

        $data['assignment_id'] = $assignmentId;
        $data['student_id'] = $studentId;
        $data['status'] = $status;

        return $this->submissionRepository->create($data);
    }

    public function getSubmissionsForAssignment($assignmentId) {
        return $this->submissionRepository->getByAssignment($assignmentId);
    }

    public function getStudentSubmissions($studentId) {
        return $this->submissionRepository->getByStudent($studentId);
    }
}
