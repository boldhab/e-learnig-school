<?php

namespace App\Models;

class Notification {
    public int $id;
    public int $user_id;
    public string $type; // 'assignment', 'grade', 'attendance', 'discussion', 'announcement', 'system', 'event', 'warning'
    public string $title;
    public string $message;
    public ?string $reference_type;
    public ?int $reference_id;
    public bool $is_read;
    public string $priority; // 'low', 'medium', 'high'
    public ?string $created_at;

    public function toArray(): array {
        return [
            'id' => $this->id ?? null,
            'user_id' => $this->user_id ?? null,
            'type' => $this->type ?? null,
            'title' => $this->title ?? null,
            'message' => $this->message ?? null,
            'reference_type' => $this->reference_type ?? null,
            'reference_id' => $this->reference_id ?? null,
            'is_read' => (bool)($this->is_read ?? false),
            'priority' => $this->priority ?? 'medium',
            'created_at' => $this->created_at ?? null,
        ];
    }
}
