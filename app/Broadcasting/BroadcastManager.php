<?php

namespace App\Broadcasting;

use App\Broadcasting\Drivers\LogDriver;
use App\Broadcasting\Drivers\PusherDriver;
use App\Events\Contracts\BroadcastableEvent;
use Exception;

class BroadcastManager {
    protected $driver;

    public function __construct() {
        $driverName = $_ENV['BROADCAST_DRIVER'] ?? 'log';

        switch ($driverName) {
            case 'pusher':
                $this->driver = new PusherDriver();
                break;
            case 'log':
            default:
                $this->driver = new LogDriver();
                break;
        }
    }

    /**
     * Broadcast an event.
     *
     * @param BroadcastableEvent $event
     * @param string|null $socketId
     * @return bool
     */
    public function broadcast(BroadcastableEvent $event, ?string $socketId = null): bool {
        try {
            return $this->driver->send(
                $event->broadcastOn(),
                $event->broadcastAs(),
                $event->broadcastWith(),
                $socketId
            );
        } catch (Exception $e) {
            error_log("Broadcasting failed: " . $e->getMessage());
            return false;
        }
    }
}
