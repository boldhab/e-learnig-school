<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\ParentService;
use Exception;

class ParentController extends BaseController {
    protected $parentService;

    public function __construct() {
        $this->parentService = new ParentService();
    }

    public function getChildren(Request $request, Response $response) {
        $this->requireRole('PARENT');
        $parentId = $GLOBALS['auth_user']['id'];
        
        try {
            $children = $this->parentService->getChildren($parentId);
            $this->success($children, 'Children retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function getChildAttendance(Request $request, Response $response, $id) {
        $this->requireRole('PARENT');
        $parentId = $GLOBALS['auth_user']['id'];
        $studentId = (int) $id;

        try {
            $attendance = $this->parentService->getChildAttendance($parentId, $studentId);
            $this->success($attendance, 'Child attendance retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function getChildOverview(Request $request, Response $response, $id) {
        $this->requireRole('PARENT');
        $parentId = $GLOBALS['auth_user']['id'];
        $studentId = (int) $id;

        try {
            $overview = $this->parentService->getChildOverview($parentId, $studentId);
            $this->success($overview, 'Child overview retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function getChildCourses(Request $request, Response $response, $id) {
        $this->requireRole('PARENT');
        $parentId = $GLOBALS['auth_user']['id'];
        $studentId = (int) $id;

        try {
            $courses = $this->parentService->getChildCourses($parentId, $studentId);
            $this->success($courses, 'Child courses retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function getChildAssignments(Request $request, Response $response, $id) {
        $this->requireRole('PARENT');
        $parentId = $GLOBALS['auth_user']['id'];
        $studentId = (int) $id;

        try {
            $assignments = $this->parentService->getChildAssignments($parentId, $studentId);
            $this->success($assignments, 'Child assignments retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function getChildPerformance(Request $request, Response $response, $id) {
        $this->requireRole('PARENT');
        $parentId = $GLOBALS['auth_user']['id'];
        $studentId = (int) $id;

        try {
            $performance = $this->parentService->getChildPerformance($parentId, $studentId);
            $this->success($performance, 'Child performance retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function getChildRiskReport(Request $request, Response $response, $id) {
        $this->requireRole('PARENT');
        $parentId = $GLOBALS['auth_user']['id'];
        $studentId = (int) $id;

        try {
            $report = $this->parentService->getChildRiskReport($parentId, $studentId);
            $this->success($report, 'Child risk report retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function getChildReports(Request $request, Response $response, $id) {
        $this->requireRole('PARENT');
        $parentId = $GLOBALS['auth_user']['id'];
        $studentId = (int) $id;

        try {
            $reports = $this->parentService->getChildReports($parentId, $studentId);
            $this->success($reports, 'Child reports retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    // Reuse existing notification logic but scoped to parent user. 
    // The NotificationController already handles this by default since it checks $GLOBALS['auth_user']['id']
}
