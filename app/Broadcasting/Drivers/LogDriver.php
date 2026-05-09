<?php

namespace App\Broadcasting\Drivers;

class LogDriver implements BroadcastDriverInterface {
    public function send(string $channel, string $event, array $data, ?string $socketId = null): bool {
        $logPath = dirname(__DIR__, 3) . '/storage/logs/broadcast.log';
        $timestamp = date('Y-m-d H:i:s');
        $payload = json_encode([
            'timestamp' => $timestamp,
            'channel' => $channel,
            'event' => $event,
            'socket_id' => $socketId,
            'data' => $data
        ], JSON_PRETTY_PRINT);

        file_put_contents($logPath, "[$timestamp] BROADCAST: $payload" . PHP_EOL, FILE_APPEND);
        return true;
    }
}
