<?php
// Inline JwtHelper to avoid autoloader issues
class JwtHelper {
    private static $secret = 'millennium_secret_key_2026';

    public static function generate($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        
        $payload['exp'] = time() + (60 * 60 * 24); // 24 hours
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
}

// Generate a test JWT
$payload = ['id' => 1, 'email' => 'test@example.com', 'role' => 'admin'];
$token = JwtHelper::generate($payload);

echo "Token: " . $token . PHP_EOL;
echo "Use: curl -i \"http://localhost/millinium/api/notifications/stream?token=" . $token . "\"" . PHP_EOL;
