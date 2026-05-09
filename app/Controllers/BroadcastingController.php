<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Traits\ApiResponseTrait;
use App\Middleware\AuthMiddleware;

class BroadcastingController {
    use ApiResponseTrait;

    protected $auth;

    public function __construct() {
        $this->auth = new AuthMiddleware();
    }

    /**
     * Authenticate a Pusher channel subscription.
     */
    public function authenticate(Request $request, Response $response) {
        // Run auth middleware manually
        $this->auth->handle($request, $response);
        
        $user = $GLOBALS['auth_user'] ?? null;
        if (!$user) {
            return $this->error('Unauthorized', 401);
        }

        $body = $request->getBody();
        $socketId = $body['socket_id'] ?? null;
        $channelName = $body['channel_name'] ?? null;

        if (!$socketId || !$channelName) {
            return $this->error('Missing socket_id or channel_name', 400);
        }

        // Implementation of Pusher Authentication Signature
        // Reference: https://pusher.com/docs/channels/library_auth_reference/auth-signatures/
        
        $key = $_ENV['PUSHER_APP_KEY'] ?? '';
        $secret = $_ENV['PUSHER_APP_SECRET'] ?? '';

        if (empty($key) || empty($secret)) {
            return $this->error('Broadcasting credentials not configured', 500);
        }

        $stringToSign = $socketId . ':' . $channelName;
        $signature = hash_hmac('sha256', $stringToSign, $secret);
        
        $auth = $key . ':' . $signature;

        return $response->json([
            'auth' => $auth
        ]);
    }
}
