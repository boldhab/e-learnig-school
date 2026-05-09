<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class UserGuideRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create(array $data): int {
        $sql = "INSERT INTO user_guides (title, description, content, target_role, created_by) 
                VALUES (:title, :description, :content, :target_role, :created_by)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'title' => $data['title'],
            'description' => $data['description'],
            'content' => $data['content'],
            'target_role' => $data['target_role'],
            'created_by' => $data['created_by']
        ]);
        
        return $this->db->lastInsertId();
    }

    public function getGuidesByRole(string $role): array {
        $sql = "SELECT * FROM user_guides WHERE target_role = 'all' OR target_role = :role ORDER BY title ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['role' => strtolower($role)]);
        return $stmt->fetchAll();
    }

    public function getGuideById(int $id): ?array {
        $sql = "SELECT * FROM user_guides WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $guide = $stmt->fetch();
        return $guide ?: null;
    }
}
