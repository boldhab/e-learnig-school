<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\GradingService;
use App\Helpers\HtmlSanitizer;
use Exception;

class GradingController extends BaseController {
    protected $gradingService;

    public function __construct() {
        $this->gradingService = new GradingService();
    }

    public function grade(Request $request, Response $response, $id) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        $marks = $data['marks'] ?? null;
        $feedback = $data['feedback'] ?? '';
        $gradedBy = $GLOBALS['auth_user']['id'];

        if ($marks === null) {
            $this->error('Marks are required', 422);
        }

        try {
            $this->gradingService->gradeSubmission($id, $marks, $feedback, $gradedBy);
            $this->success([], 'Submission graded successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function publish(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        $data = $request->getBody();
        $submissionIds = $data['submission_ids'] ?? [];

        if (empty($submissionIds)) {
            $this->error('Submission IDs are required', 422);
        }

        try {
            $this->gradingService->publishGrades($submissionIds);
            $this->success([], 'Grades published successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }
}
