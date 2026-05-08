<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\CategoryService;
use App\Helpers\HtmlSanitizer;
use Exception;

class CategoryController extends BaseController {
    protected $categoryService;

    public function __construct() {
        $this->categoryService = new CategoryService();
    }

    public function create(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());

        if (empty($data['name']) || empty($data['type'])) {
            $this->error('Name and type are required', 422);
        }

        try {
            $id = $this->categoryService->createCategory($data);
            $this->success(['category_id' => $id], 'Category created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function list(Request $request, Response $response) {
        $this->requireAuth();
        $type = $request->getBody()['type'] ?? 'Course';
        $categories = $this->categoryService->getCategoriesByType($type);
        $response->json($categories);
    }
}
