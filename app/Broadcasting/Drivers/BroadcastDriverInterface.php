<?php

namespace App\Broadcasting\Drivers;

interface BroadcastDriverInterface {
    /**
     * Send the event data to the broadcast channel.
     *
     * @param string $channel
     * @param string $event
     * @param array $data
     * @param string|null $socketId
     * @return bool
     */
    public function send(string $channel, string $event, array $data, ?string $socketId = null): bool;
}
