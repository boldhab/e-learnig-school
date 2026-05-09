<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class FAQRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create(array $data): int {
        $sql = "INSERT INTO faqs (question, answer, category, created_by) 
                VALUES (:question, :answer, :category, :created_by)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'question' => $data['question'],
            'answer' => $data['answer'],
            'category' => $data['category'],
            'created_by' => $data['created_by']
        ]);
        
        return $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $fields = [];
        $params = ['id' => $id];
        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
            $params[$key] = $value;
        }
        
        if (empty($fields)) return false;

        $sql = "UPDATE faqs SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function getPublishedFAQs(): array {
        $sql = "SELECT * FROM faqs WHERE is_published = 1 ORDER BY category ASC, created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function search(string $query): array {
        $sql = "SELECT * FROM faqs WHERE is_published = 1 AND (question LIKE :query OR answer LIKE :query) ORDER BY category ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['query' => "%$query%"]);
        return $stmt->fetchAll();
    }
}
