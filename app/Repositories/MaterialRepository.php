<?php

namespace App\Repositories;

use App\Core\Database;

class MaterialRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($data) {
        $sql = "INSERT INTO materials (title, description, subject_id, class_id, uploaded_by, cloudinary_url, public_id, file_type, file_size) 
                VALUES (:title, :description, :subject_id, :class_id, :uploaded_by, :cloudinary_url, :public_id, :file_type, :file_size)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'subject_id' => $data['subject_id'],
            'class_id' => $data['class_id'],
            'uploaded_by' => $data['uploaded_by'],
            'cloudinary_url' => $data['cloudinary_url'],
            'public_id' => $data['public_id'],
            'file_type' => $data['file_type'],
            'file_size' => $data['file_size'] ?? 0
        ]);
        
        return $this->db->lastInsertId();
    }

    public function getByCourse($courseId, $classId = null) {
        $ids = [];
        if ($classId) {
            $ids[] = $classId;
            $parentStmt = $this->db->prepare("SELECT parent_id FROM categories WHERE id = ?");
            $parentStmt->execute([$classId]);
            $parentId = $parentStmt->fetchColumn();
            if ($parentId) $ids[] = $parentId;
        }

        $sql = "SELECT m.*, u.full_name as author_name 
                FROM materials m
                JOIN users u ON m.uploaded_by = u.id
                WHERE m.subject_id = ?";
        
        $params = [$courseId];
        
        if (!empty($ids)) {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $sql .= " AND m.class_id IN ($placeholders)";
            $params = array_merge($params, $ids);
        }

        $sql .= " ORDER BY m.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM materials WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM materials WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    // Aliases for ContentService compatibility
    public function createMaterial($data) {
        return $this->create($data);
    }

    public function getMaterialsByClassAndSubject($classId, $subjectId = null) {
        return $this->getByCourse($subjectId, $classId);
    }

    public function getMaterialById($id) {
        return $this->findById($id);
    }

    public function deleteMaterial($id) {
        return $this->delete($id);
    }
}
