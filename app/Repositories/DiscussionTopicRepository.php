<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class DiscussionTopicRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($data) {
        $sql = "INSERT INTO discussion_topics (group_id, title, created_by, status) 
                VALUES (:group_id, :title, :created_by, :status)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'group_id' => $data['group_id'],
            'title' => $data['title'],
            'created_by' => $data['created_by'],
            'status' => $data['status'] ?? 'open'
        ]);
        return $this->db->lastInsertId();
    }

    public function findByGroup($groupId) {
        $sql = "SELECT t.*, u.full_name as author_name 
                FROM discussion_topics t 
                JOIN users u ON t.created_by = u.id 
                WHERE t.group_id = :group_id 
                ORDER BY t.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['group_id' => $groupId]);
        return $stmt->fetchAll();
    }

    public function findById($id) {
        $sql = "SELECT * FROM discussion_topics WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function updateStatus($id, $status) {
        $sql = "UPDATE discussion_topics SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id, 'status' => $status]);
    }

    public function delete($id) {
        $sql = "DELETE FROM discussion_topics WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
