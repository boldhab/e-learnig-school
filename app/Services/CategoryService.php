<?php

namespace App\Services;

use App\Repositories\CategoryRepository;
use App\Services\DiscussionService;

class CategoryService {
    protected $categoryRepo;
    protected $discussionService;

    public function __construct() {
        $this->categoryRepo = new CategoryRepository();
        $this->discussionService = new DiscussionService();
    }

    public function createCategory($data) {
        $id = $this->categoryRepo->create($data);
        
        // Auto-create discussion group if it's a Course
        if ($data['type'] === 'Course') {
            $section = null;
            if (isset($data['parent_id']) && $data['parent_id']) {
                $parent = $this->categoryRepo->findById($data['parent_id']);
                if ($parent) {
                    $section = $parent['name'];
                }
            }
            $this->discussionService->autoCreateGroup($id, $data['name'], $section);
        }
        
        return $id;
    }

    public function getCategoriesByType($type) {
        return $this->categoryRepo->getAllByType($type);
    }
}
