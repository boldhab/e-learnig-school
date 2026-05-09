<?php

namespace App\Models;

class Announcement {
    public int $id;
    public int $created_by;
    public string $title;
    public string $message;
    public string $target_role; // 'all', 'student', 'teacher', 'admin'
    public ?int $course_id;
    public bool $is_active;
    public ?string $created_at;
    public ?string $expires_at;

    public function toArray(): array {
        return [
            'id' => $this->id ?? null,
            'created_by' => $this->created_by ?? null,
            'title' => $this->title ?? null,
            'message' => $this->message ?? null,
            'target_role' => $this->target_role ?? null,
            'course_id' => $this->course_id ?? null,
            'is_active' => (bool)($this->is_active ?? true),
            'created_at' => $this->created_at ?? null,
            'expires_at' => $this->expires_at ?? null,
        ];
    }
}
