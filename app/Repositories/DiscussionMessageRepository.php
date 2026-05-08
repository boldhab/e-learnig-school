<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class DiscussionMessageRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($data) {
        $sql = "INSERT INTO discussion_messages (topic_id, user_id, message, parent_id) 
                VALUES (:topic_id, :user_id, :message, :parent_id)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'topic_id' => $data['topic_id'],
            'user_id' => $data['user_id'],
            'message' => $data['message'],
            'parent_id' => $data['parent_id'] ?? null
        ]);
        return $this->db->lastInsertId();
    }

    public function getByTopic($topicId) {
        $sql = "SELECT m.*, u.full_name as author_name, u.username as author_username 
                FROM discussion_messages m 
                JOIN users u ON m.user_id = u.id 
                WHERE m.topic_id = :topic_id AND m.deleted_at IS NULL 
                ORDER BY m.created_at ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['topic_id' => $topicId]);
        return $stmt->fetchAll();
    }

    public function softDelete($id) {
        $sql = "UPDATE discussion_messages SET deleted_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function findById($id) {
        $sql = "SELECT * FROM discussion_messages WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
}
