<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class AssignmentRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($data) {
        $sql = "INSERT INTO assignments (title, description, course_id, created_by, due_date, max_marks, file_url, file_public_id, file_type) 
                VALUES (:title, :description, :course_id, :created_by, :due_date, :max_marks, :file_url, :file_public_id, :file_type)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'course_id' => $data['course_id'],
            'created_by' => $data['created_by'],
            'due_date' => $data['due_date'],
            'max_marks' => $data['max_marks'],
            'file_url' => $data['file_url'] ?? null,
            'file_public_id' => $data['file_public_id'] ?? null,
            'file_type' => $data['file_type'] ?? null
        ]);
        return $this->db->lastInsertId();
    }

    public function findById($id) {
        $sql = "SELECT a.*, c.name as course_name, u.full_name as author_name 
                FROM assignments a 
                JOIN categories c ON a.course_id = c.id 
                JOIN users u ON a.created_by = u.id 
                WHERE a.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function getAll($courseId = null) {
        $sql = "SELECT a.*, c.name as course_name FROM assignments a JOIN categories c ON a.course_id = c.id";
        $params = [];
        if ($courseId) {
            $sql .= " WHERE a.course_id = :course_id";
            $params['course_id'] = $courseId;
        }
        $sql .= " ORDER BY a.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function update($id, $data) {
        $fields = [];
        $params = ['id' => $id];
        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
            $params[$key] = $value;
        }
        $sql = "UPDATE assignments SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete($id) {
        $sql = "DELETE FROM assignments WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
