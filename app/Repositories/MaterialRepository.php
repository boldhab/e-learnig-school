<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class MaterialRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function createMaterial($data) {
        $sql = "INSERT INTO materials (title, description, subject_id, class_id, uploaded_by, cloudinary_url, public_id, file_type, file_size) 
                VALUES (:title, :description, :subject_id, :class_id, :uploaded_by, :cloudinary_url, :public_id, :file_type, :file_size)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
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

    public function getMaterialsByClassAndSubject($classId, $subjectId = null) {
        $sql = "SELECT m.*, c.name as subject_name, u.full_name as teacher_name 
                FROM materials m 
                JOIN categories c ON m.subject_id = c.id 
                JOIN users u ON m.uploaded_by = u.id 
                WHERE m.class_id = :class_id AND m.status = 'active'";
        
        $params = ['class_id' => $classId];
        
        if ($subjectId) {
            $sql .= " AND m.subject_id = :subject_id";
            $params['subject_id'] = $subjectId;
        }

        $sql .= " ORDER BY m.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getMaterialById($id) {
        $sql = "SELECT * FROM materials WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function deleteMaterial($id) {
        $sql = "UPDATE materials SET status = 'inactive' WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function getCategoriesByType($type) {
        $sql = "SELECT * FROM categories WHERE type = :type";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['type' => $type]);
        return $stmt->fetchAll();
    }
}
