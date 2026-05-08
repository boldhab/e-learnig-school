<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class CategoryRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($data) {
        $sql = "INSERT INTO categories (name, type, parent_id) VALUES (:name, :type, :parent_id)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'name' => $data['name'],
            'type' => $data['type'],
            'parent_id' => $data['parent_id'] ?? null
        ]);
        return $this->db->lastInsertId();
    }

    public function findById($id) {
        $sql = "SELECT * FROM categories WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function getParent($id) {
        $sql = "SELECT p.* FROM categories c JOIN categories p ON c.parent_id = p.id WHERE c.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function getAllByType($type) {
        $sql = "SELECT * FROM categories WHERE type = :type";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['type' => $type]);
        return $stmt->fetchAll();
    }
}
