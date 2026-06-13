<?php

namespace App\Services;

use Exception;

class MailService {
    private array $config;

    public function __construct() {
        $this->config = require __DIR__ . '/../../config/mail.php';
    }

    public function send(string $to, string $subject, string $body, ?string $toName = null): bool {
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid recipient email address: {$to}");
        }

        if (($this->config['mailer'] ?? 'smtp') === 'smtp') {
            return $this->sendSmtp($to, $subject, $body, $toName);
        }

        return $this->sendNativeMail($to, $subject, $body, $toName);
    }

    private function sendNativeMail(string $to, string $subject, string $body, ?string $toName): bool {
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'From: ' . $this->formatAddress($this->config['from_address'], $this->config['from_name']),
        ];

        return mail($this->formatAddress($to, $toName), $subject, $body, implode("\r\n", $headers));
    }

    private function sendSmtp(string $to, string $subject, string $body, ?string $toName): bool {
        $host = $this->config['host'];
        $port = (int) $this->config['port'];
        $timeout = 20;
        $remote = ($this->config['encryption'] === 'ssl' ? 'ssl://' : '') . $host;
        $socket = fsockopen($remote, $port, $errno, $errstr, $timeout);

        if (!$socket) {
            throw new Exception("SMTP connection failed: {$errstr} ({$errno})");
        }

        stream_set_timeout($socket, $timeout);
        $this->expect($socket, [220]);
        $serverName = $_SERVER['SERVER_NAME'] ?? 'localhost';

        $this->command($socket, "EHLO {$serverName}", [250]);

        if ($this->config['encryption'] === 'tls') {
            $this->command($socket, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                fclose($socket);
                throw new Exception('SMTP TLS negotiation failed');
            }
            $this->command($socket, "EHLO {$serverName}", [250]);
        }

        if ($this->hasCredentials()) {
            $this->command($socket, 'AUTH LOGIN', [334]);
            $this->command($socket, base64_encode($this->config['username']), [334]);
            $this->command($socket, base64_encode($this->config['password']), [235]);
        }

        $from = $this->config['from_address'];
        $this->command($socket, "MAIL FROM:<{$from}>", [250]);
        $this->command($socket, "RCPT TO:<{$to}>", [250, 251]);
        $this->command($socket, 'DATA', [354]);

        $message = $this->buildMessage($to, $subject, $body, $toName);
        fwrite($socket, $message . "\r\n.\r\n");
        $this->expect($socket, [250]);
        $this->command($socket, 'QUIT', [221]);
        fclose($socket);

        return true;
    }

    private function buildMessage(string $to, string $subject, string $body, ?string $toName): string {
        $headers = [
            'From: ' . $this->formatAddress($this->config['from_address'], $this->config['from_name']),
            'To: ' . $this->formatAddress($to, $toName),
            'Subject: ' . $this->encodeHeader($subject),
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Date: ' . date(DATE_RFC2822),
        ];

        return implode("\r\n", $headers) . "\r\n\r\n" . str_replace("\n.", "\n..", $body);
    }

    private function command($socket, string $command, array $expectedCodes): string {
        fwrite($socket, $command . "\r\n");
        return $this->expect($socket, $expectedCodes);
    }

    private function expect($socket, array $expectedCodes): string {
        $response = '';

        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }

        $code = (int) substr($response, 0, 3);
        if (!in_array($code, $expectedCodes, true)) {
            throw new Exception('Unexpected SMTP response: ' . trim($response));
        }

        return $response;
    }

    private function hasCredentials(): bool {
        $username = $this->config['username'] ?? null;
        $password = $this->config['password'] ?? null;

        return $username && $password && strtolower((string) $username) !== 'null' && strtolower((string) $password) !== 'null';
    }

    private function formatAddress(string $email, ?string $name = null): string {
        if (!$name) {
            return $email;
        }

        return '"' . addcslashes($name, '"\\') . "\" <{$email}>";
    }

    private function encodeHeader(string $value): string {
        return '=?UTF-8?B?' . base64_encode($value) . '?=';
    }
}
