<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Middleware\AuthMiddleware;
use App\Core\Database;

class SseController {
    protected $auth;
    protected $db;

    public function __construct() {
        $this->auth = new AuthMiddleware();
        $this->db = null;
    }

    /**
     * Stream notifications to the client using Server-Sent Events.
     */
    public function stream(Request $request, Response $response) {
        // SSE Headers (set early so client doesn't see text/html on errors)
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no');

        // AuthMiddleware now handles token in query string (?token=...)
        try {
            $this->auth->handle($request, $response);
        } catch (\Exception $e) {
            header('HTTP/1.1 401 Unauthorized');
            $this->sendEvent('sse.error', ['message' => 'Unauthorized']);
            exit;
        }
        
        $user = $GLOBALS['auth_user'] ?? null;
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            $this->sendEvent('sse.error', ['message' => 'Unauthorized']);
            exit;
        }

        // Try DB connection after headers; if DB is down, return an SSE error event.
        try {
            $this->db = Database::getInstance();
        } catch (\Throwable $e) {
            header('HTTP/1.1 500 Internal Server Error');
            $this->sendEvent('sse.error', ['message' => 'Database connection failed']);
            exit;
        }

        $userId = $user['id'];
        $lastChecked = date('Y-m-d H:i:s');

        // Infinite loop to keep the connection open
        while (true) {
            // Check for new notifications in the database
            $stmt = $this->db->prepare("
                SELECT * FROM notifications 
                WHERE user_id = ? AND created_at > ? 
                ORDER BY created_at ASC
            ");
            $stmt->execute([$userId, $lastChecked]);
            $newNotifications = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            if (!empty($newNotifications)) {
                foreach ($newNotifications as $notification) {
                    $this->sendEvent('notification.received', $notification);
                    $lastChecked = $notification['created_at'];
                }
            }

            // Send a heartbeat ping every 30 seconds to keep connection alive
            if (time() % 30 === 0) {
                echo ": heartbeat\n\n";
            }

            if (connection_aborted()) {
                break;
            }

            // Sleep for a bit to avoid high CPU usage
            sleep(2);
            
            // Re-flush buffer
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }
    }

    /**
     * Format and send an SSE event.
     */
    private function sendEvent($event, $data) {
        echo "event: $event\n";
        echo "data: " . json_encode($data) . "\n\n";
        
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }
}
