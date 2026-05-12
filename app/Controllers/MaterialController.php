<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\MaterialService;
use App\Helpers\HtmlSanitizer;
use Exception;

class MaterialController extends BaseController {
    protected $materialService;

    public function __construct() {
        $this->materialService = new MaterialService();
    }

    public function upload(Request $request, Response $response) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        $file = $_FILES['material'] ?? null;

        if (!$file) {
            return $this->error('No file provided', 400);
        }

        try {
            $data['user_id'] = $GLOBALS['auth_user']['id'];
            $id = $this->materialService->uploadMaterial($file, $data);
            $this->success(['material_id' => $id], 'Material uploaded successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function list(Request $request, Response $response) {
        $this->requireAuth();
        $body = $request->getBody();
        $courseId = $body['course_id'] ?? $body['subject_id'] ?? null;
        $classId = $body['class_id'] ?? null;

        if (!$courseId) {
            return $this->error('Course or Subject ID is required', 400);
        }

        try {
            $materials = $this->materialService->getCourseMaterials($courseId, $classId);
            $this->success($materials);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function delete(Request $request, Response $response, $id) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        
        try {
            $this->materialService->deleteMaterial($id);
            $this->success([], 'Material deleted successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
