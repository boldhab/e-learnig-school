<?php

namespace App\Services;

use App\Repositories\AssignmentRepository;
use App\Helpers\CloudinaryHelper;
use Exception;

class AssignmentService {
    protected $assignmentRepository;
    protected $cloudinaryHelper;

    public function __construct() {
        $this->assignmentRepository = new AssignmentRepository();
        $this->cloudinaryHelper = new CloudinaryHelper();
    }

    public function createAssignment($data, $file = null) {
        if ($file && $file['size'] > 0) {
            $cloudinaryResult = $this->cloudinaryHelper->upload($file['tmp_name'], 'raw', [
                'folder' => 'millennium/assignments',
                'resource_type' => 'raw'
            ]);

            if (isset($cloudinaryResult['secure_url'])) {
                $data['file_url'] = $cloudinaryResult['secure_url'];
                $data['file_public_id'] = $cloudinaryResult['public_id'];
                $data['file_type'] = $file['type'];
            }
        }

        return $this->assignmentRepository->create($data);
    }

    public function getAssignment($id) {
        return $this->assignmentRepository->findById($id);
    }

    public function listAssignments($courseId = null) {
        return $this->assignmentRepository->getAll($courseId);
    }

    public function updateAssignment($id, $data) {
        return $this->assignmentRepository->update($id, $data);
    }

    public function deleteAssignment($id) {
        $assignment = $this->assignmentRepository->findById($id);
        if ($assignment && $assignment['file_public_id']) {
            $this->cloudinaryHelper->delete($assignment['file_public_id'], 'raw');
        }
        return $this->assignmentRepository->delete($id);
    }
}
