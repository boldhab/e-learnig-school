<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\HelpSupportService;
use App\Helpers\HtmlSanitizer;
use Exception;

class HelpController extends BaseController {
    protected $helpService;

    public function __construct() {
        $this->helpService = new HelpSupportService();
    }

    public function getFAQs(Request $request, Response $response) {
        // Public/Authenticated access
        $params = $request->getBody();
        $query = $params['query'] ?? null;
        
        try {
            if ($query) {
                $faqs = $this->helpService->searchFAQs($query);
            } else {
                $faqs = $this->helpService->getFAQs();
            }
            $this->success($faqs, 'FAQs retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function createFAQ(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['created_by'] = $GLOBALS['auth_user']['id'];
        
        try {
            $id = $this->helpService->createFAQ($data);
            $this->success(['id' => $id], 'FAQ created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function updateFAQ(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        
        try {
            $this->helpService->updateFAQ($id, $data);
            $this->success([], 'FAQ updated successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getGuides(Request $request, Response $response) {
        $this->requireAuth();
        
        $roleName = strtolower($this->getRoleName($GLOBALS['auth_user']['role_id']));
        
        try {
            $guides = $this->helpService->getGuides($roleName);
            $this->success($guides, 'User guides retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function createGuide(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['created_by'] = $GLOBALS['auth_user']['id'];
        
        try {
            $id = $this->helpService->createGuide($data);
            $this->success(['id' => $id], 'User guide created successfully', 201);
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
