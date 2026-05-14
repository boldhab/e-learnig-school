<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\GapAnalysisService;
use Exception;

class GapAnalysisController extends BaseController {
    protected $gapAnalysisService;

    public function __construct() {
        $this->gapAnalysisService = new GapAnalysisService();
    }

    public function generate(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        
        $params = $request->getBody();
        if (empty($params['student_id']) || empty($params['course_id'])) {
            $this->error('Student ID and Course ID are required', 400);
        }

        try {
            $report = $this->gapAnalysisService->generateAnalysis(
                $params['student_id'], 
                $params['course_id'], 
                $GLOBALS['auth_user']['id']
            );
            $this->success($report, 'Gap analysis generated successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getByStudent(Request $request, Response $response, $id) {
        $this->requireRole(['STUDENT', 'TEACHER', 'ADMIN']);
        
        $currentUser = $GLOBALS['auth_user'];
        if ($currentUser['role_id'] == 3 && $currentUser['id'] != $id) {
            $this->error('Forbidden: You can only view your own gap analysis', 403);
        }

        $params = $request->getBody();
        $courseId = $params['course_id'] ?? null;
        
        try {
            $records = $this->gapAnalysisService->getStudentAnalysis($id, $courseId);
            $this->success($records, 'Student gap analysis records retrieved');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getHighRisk(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        
        try {
            $records = $this->gapAnalysisService->getHighRiskStudents();
            $this->success($records, 'High risk students retrieved');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getRiskReport(Request $request, Response $response) {
        $this->requireRole(['TEACHER', 'ADMIN']);

        try {
            $records = $this->gapAnalysisService->getHighRiskStudents();
            $this->success($records, 'Risk report retrieved');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }
}
