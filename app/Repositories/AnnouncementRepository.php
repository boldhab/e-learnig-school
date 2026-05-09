<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class AnnouncementRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create(array $data): int {
        $sql = "INSERT INTO announcements (created_by, title, message, target_role, course_id, expires_at) 
                VALUES (:created_by, :title, :message, :target_role, :course_id, :expires_at)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'created_by' => $data['created_by'],
            'title' => $data['title'],
            'message' => $data['message'],
            'target_role' => $data['target_role'],
            'course_id' => $data['course_id'] ?? null,
            'expires_at' => $data['expires_at'] ?? null
        ]);
        
        return $this->db->lastInsertId();
    }

    public function getActiveAnnouncements(string $role, ?int $courseId = null): array {
        $sql = "SELECT a.*, u.full_name as author_name 
                FROM announcements a 
                JOIN users u ON a.created_by = u.id 
                WHERE a.is_active = 1 
                AND (a.expires_at IS NULL OR a.expires_at > NOW()) 
                AND (a.target_role = 'all' OR a.target_role = :role)";
        
        $params = ['role' => strtolower($role)];

        if ($courseId) {
            $sql .= " AND (a.course_id IS NULL OR a.course_id = :course_id)";
            $params['course_id'] = $courseId;
        } else {
            $sql .= " AND a.course_id IS NULL";
        }

        $sql .= " ORDER BY a.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    }

    public function delete(int $id): bool {
        $sql = "DELETE FROM announcements WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
