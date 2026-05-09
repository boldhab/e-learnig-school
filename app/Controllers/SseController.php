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
        $this->db = Database::getInstance();
    }

    /**
     * Stream notifications to the client using Server-Sent Events.
     */
    public function stream(Request $request, Response $response) {
        // AuthMiddleware now handles token in query string (?token=...)
        try {
            $this->auth->handle($request, $response);
        } catch (\Exception $e) {
            header('HTTP/1.1 401 Unauthorized');
            echo "auth failed";
            exit;
        }
        
        $user = $GLOBALS['auth_user'] ?? null;
        if (!$user) {
            header('HTTP/1.1 401 Unauthorized');
            echo "user not found";
            exit;
        }

        // SSE Headers
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no'); // Disable buffering for Nginx if present

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
