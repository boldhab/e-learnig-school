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
            $records = $this->gapAnalysisService->getStudentAnalysis($id, $courseId, (int)($currentUser['id'] ?? 1));
            $this->success($records, 'Student gap analysis records retrieved');
        } catch (Exception $e) {
            error_log('getByStudent error: ' . $e->getMessage());
            $this->error('Failed to retrieve gap analysis', 500);
        }
    }

    public function getHighRisk(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        
        try {
            $records = $this->gapAnalysisService->getHighRiskStudents();
            $this->success($records, 'High risk students retrieved');
        } catch (Exception $e) {
            error_log('getHighRisk error: ' . $e->getMessage());
            $this->error('Failed to retrieve high risk students', 500);
        }
    }

    public function getRiskReport(Request $request, Response $response) {
        $this->requireRole(['TEACHER', 'ADMIN']);

        $currentUser = $GLOBALS['auth_user'];
        $userId = (int) ($currentUser['id'] ?? 0);
        $role = $currentUser['role'] ?? '';

        try {
            // Auto-generate/update gap analysis for all relevant students to ensure live, real-time data
            $courseRepo = new \App\Repositories\CourseRepository();
            if ($role === 'TEACHER') {
                $teacherCourses = $courseRepo->getCoursesByTeacher($userId);
                foreach ($teacherCourses as $tc) {
                    $students = $courseRepo->getStudentsByCourse((int)$tc['id'], (int)$tc['class_id']);
                    foreach ($students as $student) {
                        try {
                            $this->gapAnalysisService->generateAnalysis((int)$student['id'], (int)$tc['id'], $userId);
                        } catch (Exception $innerEx) {
                            error_log("Failed auto-generating gap analysis for student {$student['id']}: " . $innerEx->getMessage());
                        }
                    }
                }
            } elseif ($role === 'ADMIN') {
                $allCourses = $courseRepo->getAll();
                foreach ($allCourses as $c) {
                    $students = $courseRepo->getStudentsByCourse((int)$c['id']);
                    foreach ($students as $student) {
                        try {
                            $this->gapAnalysisService->generateAnalysis((int)$student['id'], (int)$c['id'], $userId);
                        } catch (Exception $innerEx) {
                            error_log("Failed auto-generating gap analysis for student {$student['id']} (Admin): " . $innerEx->getMessage());
                        }
                    }
                }
            }

            $records = $this->gapAnalysisService->getHighRiskStudents();
            $this->success($records, 'Risk report retrieved');
        } catch (Exception $e) {
            $msg = $e->getMessage();
            error_log('getRiskReport error: ' . $msg);

            // If the gap_analysis table simply doesn't exist yet, return empty data
            // gracefully (not a client error — table will be created on next request).
            if (
                strpos($msg, '42S02') !== false ||
                stripos($msg, "doesn't exist") !== false ||
                stripos($msg, 'gap_analysis') !== false
            ) {
                $this->success([], 'Risk report retrieved');
                return;
            }

            $this->error('Failed to retrieve risk report', 500);
        }
    }
}
