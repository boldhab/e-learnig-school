<?php

namespace App\Models;

class FAQ {
    public int $id;
    public string $question;
    public string $answer;
    public string $category;
    public bool $is_published;
    public int $created_by;
    public ?string $created_at;
    public ?string $updated_at;

    public function toArray(): array {
        return [
            'id' => $this->id ?? null,
            'question' => $this->question ?? null,
            'answer' => $this->answer ?? null,
            'category' => $this->category ?? null,
            'is_published' => (bool)($this->is_published ?? true),
            'created_by' => $this->created_by ?? null,
            'created_at' => $this->created_at ?? null,
            'updated_at' => $this->updated_at ?? null,
        ];
    }
}
