<?php

namespace App\Models;

class SupportTicket {
    public int $id;
    public int $user_id;
    public string $subject;
    public string $category; // 'technical', 'account', 'assignment', 'attendance', 'grading', 'system', 'other'
    public string $message;
    public string $status; // 'open', 'in_progress', 'resolved', 'closed'
    public string $priority; // 'low', 'medium', 'high'
    public ?int $assigned_to;
    public ?string $created_at;
    public ?string $updated_at;

    public function toArray(): array {
        return [
            'id' => $this->id ?? null,
            'user_id' => $this->user_id ?? null,
            'subject' => $this->subject ?? null,
            'category' => $this->category ?? null,
            'message' => $this->message ?? null,
            'status' => $this->status ?? 'open',
            'priority' => $this->priority ?? 'medium',
            'assigned_to' => $this->assigned_to ?? null,
            'created_at' => $this->created_at ?? null,
            'updated_at' => $this->updated_at ?? null,
        ];
    }
}
