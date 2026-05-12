<?php

namespace App\Core;

use PDO;
use PDOException;

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        $config = require __DIR__ . '/../../config/database.php';
        
        $host = $config['host'];
        $port = $config['port'] ?? null;
        $db   = $config['database'];
        $user = $config['username'];
        $pass = $config['password'];
        $charset = $config['charset'];

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        if (!empty($port)) {
            $dsn .= ";port=$port";
        }
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->connection = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {

            $path = $_SERVER['REQUEST_URI'] ?? '';
            $isApiRequest = (strpos($path, '/api/') !== false);

            // Special-case SSE stream endpoint: EventSource requires text/event-stream.
            if ($isApiRequest && strpos($path, '/notifications/stream') !== false) {
                http_response_code(500);
                header('Content-Type: text/event-stream');
                header('Cache-Control: no-cache');
                echo "event: sse.error\n";
                echo "data: " . json_encode([
                    'message' => 'Database connection failed',
                    'error' => $e->getMessage(),
                ]) . "\n\n";
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
                exit;
            }

            if ($isApiRequest) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Database connection failed',
                    'data' => [
                        'error' => $e->getMessage(),
                    ],
                ]);
                exit;
            }

            die("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance->connection;
    }
}
