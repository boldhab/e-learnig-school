<?php

namespace App\Repositories;

use App\Core\Database;

class MaterialRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
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
        $sql = "SELECT m.*, u.full_name as author_name 
                FROM materials m
                JOIN users u ON m.uploaded_by = u.id
                WHERE m.subject_id = :course_id";
        
        $params = ['course_id' => $courseId];
        
        if ($classId) {
            $sql .= " AND m.class_id = :class_id";
            $params['class_id'] = $classId;
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
}
