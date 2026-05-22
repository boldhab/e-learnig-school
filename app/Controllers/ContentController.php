<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\ContentService;
use App\Traits\ApiResponseTrait;
use App\Traits\LoggerTrait;
use App\Helpers\HtmlSanitizer;
use App\Core\Validation;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Repositories\UserRepository;

class ContentController {
    use ApiResponseTrait, LoggerTrait;

    protected $contentService;
    protected $validation;

    public function __construct() {
        $this->contentService = new ContentService();
        $this->validation = new Validation();
        
        $auth = new AuthMiddleware();
        $auth->handle(new Request(), new Response());
    }

    public function upload(Request $request, Response $response) {
        // Only teachers and admins can upload
        $user = $GLOBALS['auth_user'];
        if ($user['role'] === 'STUDENT') {
            return $this->error('Only teachers can upload materials', 403);
        }

        $data = HtmlSanitizer::sanitize($request->getBody());
        
        // Handle course_id from frontend if subject_id is missing
        if (!isset($data['subject_id']) && isset($data['course_id'])) {
            $data['subject_id'] = $data['course_id'];
        }

        $file = $_FILES['material'] ?? null;

        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            return $this->error('File upload failed or no file provided', 400);
        }

        if (!$this->validation->validate($data, [
            'title' => 'required',
            'subject_id' => 'required',
            'class_id' => 'required'
        ])) {
            return $this->error('Validation failed', 422, $this->validation->getErrors());
        }

        try {
            $data['uploaded_by'] = $user['id']; // Use 'id' instead of 'user_id' based on Auth middleware
            $id = $this->contentService->uploadMaterial($data, $file);
            return $this->success(['material_id' => $id], 'Material uploaded successfully', 201);
        } catch (\Exception $e) {
            $this->logError($e->getMessage());
            return $this->error($e->getMessage(), 500);
        }
    }

    public function listForStudent(Request $request, Response $response) {
        $user = $GLOBALS['auth_user'];

        $query = $request->getBody();
        $classId = $query['class_id'] ?? null;
        $subjectId = $query['subject_id'] ?? $query['course_id'] ?? null;

        // Student pages only know the selected course. Resolve class_id from the
        // authenticated user profile so GET /api/materials works without extra state.
        if (!$classId && (($user['role'] ?? null) === 'STUDENT')) {
            $userId = (int) ($user['id'] ?? $user['user_id'] ?? 0);
            if ($userId > 0) {
                $dbUser = (new UserRepository())->findById($userId);
                $classId = $dbUser['class_id'] ?? null;
            }
        }

        if (!$classId) {
            return $this->error('Class ID is required', 400);
        }

        try {
            $materials = $this->contentService->getStudentMaterials($classId, $subjectId);
            return $this->success($materials);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function delete(Request $request, Response $response) {
        $user = $GLOBALS['auth_user'];
        $data = $request->getBody();
        $id = $data['id'] ?? null;

        if (!$id) return $this->error('Material ID required', 400);

        try {
            $this->contentService->deleteMaterial($id, $user['user_id']);
            return $this->success([], 'Material deleted successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 403);
        }
    }
}
