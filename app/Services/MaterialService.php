<?php

namespace App\Services;

use App\Repositories\MaterialRepository;
use App\Helpers\CloudinaryHelper;
use Exception;

class MaterialService {
    protected $materialRepo;
    protected $cloudinary;

    public function __construct() {
        $this->materialRepo = new MaterialRepository();
        $this->cloudinary = new CloudinaryHelper();
    }

    public function uploadMaterial($file, $data) {
        if (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
            throw new Exception("No file uploaded.");
        }

        // 1. Upload to Cloudinary
        // Extract folder from env or config
        $folder = $_ENV['CLOUDINARY_UPLOAD_PRESET'] ?? 'millennium_materials';
        
        $uploadResult = $this->cloudinary->upload($file['tmp_name'], 'auto', [
            'folder' => $folder,
            'resource_type' => 'auto'
        ]);

        if (!$uploadResult || !isset($uploadResult['secure_url'])) {
            throw new Exception("Cloudinary upload failed.");
        }

        // 2. Prepare data for DB
        $dbData = [
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'subject_id' => $data['course_id'],
            'class_id' => $data['class_id'],
            'uploaded_by' => $data['user_id'],
            'cloudinary_url' => $uploadResult['secure_url'],
            'public_id' => $uploadResult['public_id'],
            'file_type' => $uploadResult['format'] ?? $uploadResult['resource_type'],
            'file_size' => $uploadResult['bytes'] ?? 0
        ];

        // 3. Save to DB
        return $this->materialRepo->create($dbData);
    }

    public function getCourseMaterials($courseId, $classId = null) {
        return $this->materialRepo->getByCourse($courseId, $classId);
    }

    public function deleteMaterial($id) {
        $material = $this->materialRepo->findById($id);
        if (!$material) {
            throw new Exception("Material not found.");
        }

        // 1. Delete from Cloudinary
        $this->cloudinary->delete($material['public_id'], $material['file_type'] === 'pdf' ? 'image' : 'raw');

        // 2. Delete from DB
        return $this->materialRepo->delete($id);
    }
}
