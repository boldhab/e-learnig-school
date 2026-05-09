<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class NotificationRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create(array $data): int {
        $sql = "INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id, priority) 
                VALUES (:user_id, :type, :title, :message, :reference_type, :reference_id, :priority)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'user_id' => $data['user_id'],
            'type' => $data['type'],
            'title' => $data['title'],
            'message' => $data['message'],
            'reference_type' => $data['reference_type'] ?? null,
            'reference_id' => $data['reference_id'] ?? null,
            'priority' => $data['priority'] ?? 'medium'
        ]);
        
        return $this->db->lastInsertId();
    }

    public function getUserNotifications(int $userId, int $limit = 50, int $offset = 0): array {
        $sql = "SELECT * FROM notifications 
                WHERE user_id = :user_id 
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :offset";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    public function getUnreadCount(int $userId): int {
        $sql = "SELECT COUNT(*) FROM notifications WHERE user_id = :user_id AND is_read = 0";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return (int) $stmt->fetchColumn();
    }

    public function markAsRead(int $id, int $userId): bool {
        $sql = "UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id, 'user_id' => $userId]);
    }

    public function markAllAsRead(int $userId): bool {
        $sql = "UPDATE notifications SET is_read = 1 WHERE user_id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['user_id' => $userId]);
    }
}
