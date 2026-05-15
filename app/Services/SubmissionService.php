<?php

namespace App\Services;

use App\Repositories\SubmissionRepository;
use App\Helpers\CloudinaryHelper;
use Exception;

class SubmissionService {
    protected $submissionRepo;
    protected $cloudinary;

    public function __construct() {
        $this->submissionRepo = new SubmissionRepository();
        $this->cloudinary = new CloudinaryHelper();
    }

    public function submitAssignment($data, $file = null) {
        $submissionData = [
            'assignment_id' => $data['assignment_id'],
            'student_id' => $data['student_id'],
            'answer_text' => $data['answer_text'] ?? null,
            'status' => 'pending'
        ];

        if ($file && $file['size'] > 0) {
            $uploadResult = $this->cloudinary->upload($file['tmp_name'], 'raw', [
                'folder' => 'millennium/submissions'
            ]);

            if (isset($uploadResult['secure_url'])) {
                $submissionData['submission_file_url'] = $uploadResult['secure_url'];
                $submissionData['submission_file_public_id'] = $uploadResult['public_id'];
            }
        }

        return $this->submissionRepo->create($submissionData);
    }

    public function getStudentSubmissions($studentId) {
        return $this->submissionRepo->getByStudent($studentId);
    }

    public function getAssignmentSubmissions($assignmentId) {
        return $this->submissionRepo->getByAssignment($assignmentId);
    }

    public function getTeacherSubmissions($teacherId) {
        return $this->submissionRepo->getByTeacher($teacherId);
    }
}
