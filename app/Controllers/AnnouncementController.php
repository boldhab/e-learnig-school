<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AnnouncementService;
use App\Helpers\HtmlSanitizer;
use Exception;

class AnnouncementController extends BaseController {
    protected $announcementService;

    public function __construct() {
        $this->announcementService = new AnnouncementService();
    }

    public function create(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['created_by'] = $GLOBALS['auth_user']['id'];
        
        try {
            $id = $this->announcementService->createAnnouncement($data);
            $this->success(['id' => $id], 'Announcement created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function list(Request $request, Response $response) {
        $this->requireAuth();
        
        $params = $request->getBody();
        $courseId = $params['course_id'] ?? null;
        
        $roleName = strtolower($this->getRoleName($GLOBALS['auth_user']['role_id']));

        try {
            $announcements = $this->announcementService->getAnnouncements($roleName, $courseId);
            $this->success($announcements, 'Announcements retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function delete(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');
        
        try {
            $this->announcementService->deleteAnnouncement($id);
            $this->success([], 'Announcement deleted successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    private function getRoleName(int $roleId): string {
        switch ($roleId) {
            case 1: return 'admin';
            case 2: return 'teacher';
            case 3: return 'student';
            default: return 'all';
        }
    }
}
