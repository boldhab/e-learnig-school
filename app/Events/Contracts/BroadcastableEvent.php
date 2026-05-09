<?php

namespace App\Events\Contracts;

interface BroadcastableEvent {
    /**
     * Get the channel name the event should broadcast on.
     */
    public function broadcastOn(): string;

    /**
     * Get the name of the event as it should appear in the broadcast.
     */
    public function broadcastAs(): string;

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array;
}
