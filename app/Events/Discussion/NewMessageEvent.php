<?php

namespace App\Events\Discussion;

use App\Events\Contracts\BroadcastableEvent;

class NewMessageEvent implements BroadcastableEvent {
    public $message;

    public function __construct($message) {
        $this->message = $message;
    }

    public function broadcastOn(): string {
        return 'discussion.topic.' . $this->message['topic_id'];
    }

    public function broadcastAs(): string {
        return 'NewMessage';
    }

    public function broadcastWith(): array {
        return [
            'message' => $this->message
        ];
    }
}
