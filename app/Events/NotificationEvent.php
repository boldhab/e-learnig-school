<?php

namespace App\Events;

use App\Events\Contracts\BroadcastableEvent;

class NotificationEvent implements BroadcastableEvent {
    protected $userId;
    protected $data;

    public function __construct(int $userId, array $data) {
        $this->userId = $userId;
        $this->data = $data;
    }

    public function broadcastOn(): array {
        return ["private-user-{$this->userId}"];
    }

    public function broadcastAs(): string {
        return 'notification.received';
    }

    public function broadcastWith(): array {
        return $this->data;
    }
}
