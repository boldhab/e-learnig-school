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
        $studentId = $GLOBALS['auth_user']['id'];
        $file = $_FILES['submission_file'] ?? null;

        try {
            $submissionId = $this->submissionService->submitAssignment($id, $studentId, $data, $file);
            $this->success(['submission_id' => $submissionId], 'Assignment submitted successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getSubmissionsByAssignment(Request $request, Response $response, $id) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        $submissions = $this->submissionService->getSubmissionsForAssignment($id);
        $response->json($submissions);
    }

    public function getStudentSubmissions(Request $request, Response $response) {
        $this->requireRole('STUDENT');
        $studentId = $GLOBALS['auth_user']['id'];
        $submissions = $this->submissionService->getStudentSubmissions($studentId);
        $response->json($submissions);
    }
}
