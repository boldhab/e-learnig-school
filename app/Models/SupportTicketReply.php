<?php

namespace App\Models;

class SupportTicketReply {
    public int $id;
    public int $ticket_id;
    public int $user_id;
    public string $message;
    public ?string $created_at;

    public function toArray(): array {
        return [
            'id' => $this->id ?? null,
            'ticket_id' => $this->ticket_id ?? null,
            'user_id' => $this->user_id ?? null,
            'message' => $this->message ?? null,
            'created_at' => $this->created_at ?? null,
        ];
    }
}
