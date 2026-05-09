<?php

namespace App\Core\Events;

use App\Broadcasting\BroadcastManager;
use App\Events\Contracts\BroadcastableEvent;

class EventDispatcher {
    protected $broadcastManager;

    public function __construct() {
        $this->broadcastManager = new BroadcastManager();
    }

    /**
     * Dispatch an event.
     *
     * @param object $event
     * @param string|null $socketId
     * @return void
     */
    public function dispatch($event, ?string $socketId = null) {
        // If the event should be broadcast, pass it to the BroadcastManager
        if ($event instanceof BroadcastableEvent) {
            $this->broadcastManager->broadcast($event, $socketId);
        }

        // Future: Handle local listeners here
    }
}
