<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\SubmissionService;
use App\Helpers\HtmlSanitizer;
use Exception;

class SubmissionController extends BaseController {
    protected $submissionService;

    public function __construct() {
        $this->submissionService = new SubmissionService();
    }

    public function submit(Request $request, Response $response, $id) {
        $this->requireRole('STUDENT');
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['assignment_id'] = $id;
        $data['student_id'] = $GLOBALS['auth_user']['id'];
        
        $file = $_FILES['submission_file'] ?? null;

        try {
            $submissionId = $this->submissionService->submitAssignment($data, $file);
            $this->success(['submission_id' => $submissionId], 'Assignment submitted successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getSubmissionsByAssignment(Request $request, Response $response, $id) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        try {
            $submissions = $this->submissionService->getAssignmentSubmissions($id);
            $this->success($submissions);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getStudentSubmissions(Request $request, Response $response) {
        $this->requireRole('STUDENT');
        try {
            $studentId = $GLOBALS['auth_user']['id'];
            $submissions = $this->submissionService->getStudentSubmissions($studentId);
            $this->success($submissions);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
