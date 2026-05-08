<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AssignmentService;
use App\Helpers\HtmlSanitizer;
use Exception;

class AssignmentController extends BaseController {
    protected $assignmentService;

    public function __construct() {
        $this->assignmentService = new AssignmentService();
    }

    public function create(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['created_by'] = $GLOBALS['auth_user']['id'];
        $file = $_FILES['attachment'] ?? null;

        try {
            $id = $this->assignmentService->createAssignment($data, $file);
            $this->success(['assignment_id' => $id], 'Assignment created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function list(Request $request, Response $response) {
        $this->requireAuth();
        $params = $request->getBody();
        $courseId = $params['course_id'] ?? null;
        $assignments = $this->assignmentService->listAssignments($courseId);
        $response->json($assignments);
    }

    public function get(Request $request, Response $response, $id) {
        $this->requireAuth();
        $assignment = $this->assignmentService->getAssignment($id);
        if (!$assignment) {
            $this->error('Assignment not found', 404);
        }
        $response->json($assignment);
    }

    public function update(Request $request, Response $response, $id) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        $data = HtmlSanitizer::sanitize($request->getBody());
        
        try {
            $this->assignmentService->updateAssignment($id, $data);
            $this->success([], 'Assignment updated successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function delete(Request $request, Response $response, $id) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        try {
            $this->assignmentService->deleteAssignment($id);
            $this->success([], 'Assignment deleted successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }
}
