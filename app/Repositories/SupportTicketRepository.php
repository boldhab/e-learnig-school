<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class SupportTicketRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function createTicket(array $data): int {
        $sql = "INSERT INTO support_tickets (user_id, subject, category, message, priority) 
                VALUES (:user_id, :subject, :category, :message, :priority)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'user_id' => $data['user_id'],
            'subject' => $data['subject'],
            'category' => $data['category'],
            'message' => $data['message'],
            'priority' => $data['priority'] ?? 'medium'
        ]);
        
        return $this->db->lastInsertId();
    }

    public function createReply(array $data): int {
        $sql = "INSERT INTO support_ticket_replies (ticket_id, user_id, message) 
                VALUES (:ticket_id, :user_id, :message)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'ticket_id' => $data['ticket_id'],
            'user_id' => $data['user_id'],
            'message' => $data['message']
        ]);
        
        // Update ticket updated_at
        $this->db->prepare("UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?")->execute([$data['ticket_id']]);
        
        return $this->db->lastInsertId();
    }

    public function getUserTickets(int $userId): array {
        $sql = "SELECT * FROM support_tickets WHERE user_id = :user_id ORDER BY updated_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function getAllTickets(): array {
        $sql = "SELECT t.*, u.full_name as creator_name 
                FROM support_tickets t 
                JOIN users u ON t.user_id = u.id 
                ORDER BY t.updated_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getTicketById(int $id): ?array {
        $sql = "SELECT t.*, u.full_name as creator_name 
                FROM support_tickets t 
                JOIN users u ON t.user_id = u.id 
                WHERE t.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $ticket = $stmt->fetch();
        
        if (!$ticket) return null;

        // Fetch replies
        $replySql = "SELECT r.*, u.full_name, u.role_id 
                     FROM support_ticket_replies r 
                     JOIN users u ON r.user_id = u.id 
                     WHERE r.ticket_id = :ticket_id 
                     ORDER BY r.created_at ASC";
        $replyStmt = $this->db->prepare($replySql);
        $replyStmt->execute(['ticket_id' => $id]);
        $ticket['replies'] = $replyStmt->fetchAll();

        return $ticket;
    }

    public function updateStatus(int $id, string $status): bool {
        $sql = "UPDATE support_tickets SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['status' => $status, 'id' => $id]);
    }
}
