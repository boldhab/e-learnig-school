<?php

namespace App\Broadcasting\Drivers;

use Pusher\Pusher;
use Exception;

class PusherDriver implements BroadcastDriverInterface {
    protected $pusher;

    public function __construct() {
        $options = [
            'cluster' => $_ENV['PUSHER_APP_CLUSTER'] ?? 'mt1',
            'useTLS' => true
        ];

        // Only instantiate if credentials are provided
        if (!empty($_ENV['PUSHER_APP_KEY'])) {
            try {
                $this->pusher = new Pusher(
                    $_ENV['PUSHER_APP_KEY'],
                    $_ENV['PUSHER_APP_SECRET'],
                    $_ENV['PUSHER_APP_ID'],
                    $options
                );
            } catch (Exception $e) {
                error_log("Pusher instantiation failed: " . $e->getMessage());
            }
        }
    }

    public function send(string $channel, string $event, array $data, ?string $socketId = null): bool {
        if (!$this->pusher) {
            return false;
        }

        try {
            $this->pusher->trigger($channel, $event, $data, $socketId);
            return true;
        } catch (Exception $e) {
            error_log("Pusher broadcast failed: " . $e->getMessage());
            return false;
        }
    }
}
