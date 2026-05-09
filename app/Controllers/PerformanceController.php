<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\PerformanceService;
use Exception;

class PerformanceController extends BaseController {
    protected $performanceService;

    public function __construct() {
        $this->performanceService = new PerformanceService();
    }

    public function generate(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        
        $params = $request->getBody();
        if (empty($params['student_id']) || empty($params['course_id'])) {
            $this->error('Student ID and Course ID are required', 400);
        }

        try {
            $report = $this->performanceService->generateReport($params['student_id'], $params['course_id']);
            $this->success($report, 'Performance report generated successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getByStudent(Request $request, Response $response, $id) {
        $this->requireRole(['STUDENT', 'TEACHER', 'ADMIN']);
        
        $currentUser = $GLOBALS['auth_user'];
        if ($currentUser['role_id'] == 3 && $currentUser['id'] != $id) {
            $this->error('Forbidden: You can only view your own performance', 403);
        }

        $params = $request->getBody();
        $courseId = $params['course_id'] ?? null;
        
        try {
            $records = $this->performanceService->getStudentPerformance($id, $courseId);
            $this->success($records, 'Student performance records retrieved');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getByCourse(Request $request, Response $response, $id) {
        $this->requireRole(['TEACHER', 'ADMIN']);
        
        try {
            $records = $this->performanceService->getCoursePerformance($id);
            $this->success($records, 'Course performance records retrieved');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    public function getStudentDashboardStats(Request $request, Response $response) {
        $this->requireRole('STUDENT');
        $studentId = $GLOBALS['auth_user']['id'];
        
        try {
            $stats = $this->performanceService->getStudentDashboardSummary($studentId);
            $this->success($stats);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
