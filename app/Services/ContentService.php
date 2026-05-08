<?php

namespace App\Services;

use App\Repositories\MaterialRepository;
use App\Helpers\CloudinaryHelper;
use Exception;

class ContentService {
    protected $materialRepository;
    protected $cloudinaryHelper;

    public function __construct() {
        $this->materialRepository = new MaterialRepository();
        $this->cloudinaryHelper = new CloudinaryHelper();
    }

    public function uploadMaterial($data, $file) {
        // 1. Upload to Cloudinary
        $resourceType = $this->getResourceType($file['type']);
        $cloudinaryResult = $this->cloudinaryHelper->upload($file['tmp_name'], $resourceType, [
            'folder' => 'millennium/materials',
            'resource_type' => $resourceType
        ]);

        // 2. Prepare database data
        $materialData = [
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'subject_id' => $data['subject_id'],
            'class_id' => $data['class_id'],
            'uploaded_by' => $data['uploaded_by'],
            'cloudinary_url' => $cloudinaryResult['secure_url'],
            'public_id' => $cloudinaryResult['public_id'],
            'file_type' => $cloudinaryResult['format'] ?? $resourceType,
            'file_size' => $cloudinaryResult['bytes'] ?? 0
        ];

        // 3. Save to database
        return $this->materialRepository->createMaterial($materialData);
    }

    public function getStudentMaterials($classId, $subjectId = null) {
        return $this->materialRepository->getMaterialsByClassAndSubject($classId, $subjectId);
    }

    public function deleteMaterial($id, $teacherId) {
        $material = $this->materialRepository->getMaterialById($id);
        if (!$material || $material['uploaded_by'] !== $teacherId) {
            throw new Exception("Unauthorized or material not found.");
        }

        // Delete from Cloudinary
        $resourceType = $this->getResourceTypeByFormat($material['file_type']);
        $this->cloudinaryHelper->delete($material['public_id'], $resourceType);

        // Deactivate in database
        return $this->materialRepository->deleteMaterial($id);
    }

    protected function getResourceType($mimeType) {
        if (strpos($mimeType, 'video') !== false) return 'video';
        if (strpos($mimeType, 'audio') !== false) return 'video'; // Cloudinary treats audio as video
        if (strpos($mimeType, 'image') !== false) return 'image';
        return 'raw';
    }

    protected function getResourceTypeByFormat($format) {
        $videoFormats = ['mp4', 'avi', 'mov', 'mp3', 'wav'];
        if (in_array(strtolower($format), $videoFormats)) return 'video';
        $imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (in_array(strtolower($format), $imageFormats)) return 'image';
        return 'raw';
    }
}
