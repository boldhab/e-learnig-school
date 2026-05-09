<?php

namespace App\Models;

class UserGuide {
    public int $id;
    public string $title;
    public string $description;
    public string $content;
    public string $target_role; // 'student', 'teacher', 'admin', 'all'
    public int $created_by;
    public ?string $created_at;
    public ?string $updated_at;

    public function toArray(): array {
        return [
            'id' => $this->id ?? null,
            'title' => $this->title ?? null,
            'description' => $this->description ?? null,
            'content' => $this->content ?? null,
            'target_role' => $this->target_role ?? null,
            'created_by' => $this->created_by ?? null,
            'created_at' => $this->created_at ?? null,
            'updated_at' => $this->updated_at ?? null,
        ];
    }
}
