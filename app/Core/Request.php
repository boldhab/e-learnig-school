<?php

namespace App\Core;

class Request {
    public function getPath() {
        $path = $_SERVER['REQUEST_URI'] ?? '/';
        
        // Remove query string
        $position = strpos($path, '?');
        if ($position !== false) {
            $path = substr($path, 0, $position);
        }

        // Handle XAMPP subdirectory and front controller
        $prefixes = ['/millinium/public/main.php', '/millinium/public', '/millinium'];
        foreach ($prefixes as $prefix) {
            if (strpos($path, $prefix) === 0) {
                $path = substr($path, strlen($prefix));
                break;
            }
        }

        return ($path !== '' && $path !== false) ? $path : '/';
    }

    public function getMethod() {
        return strtolower($_SERVER['REQUEST_METHOD']);
    }

    public function getBody() {
        $body = [];
        if ($this->getMethod() === 'get') {
            foreach ($_GET as $key => $value) {
                $body[$key] = filter_input(INPUT_GET, $key, FILTER_SANITIZE_SPECIAL_CHARS);
            }
        }
        if ($this->getMethod() === 'post' || $this->getMethod() === 'put' || $this->getMethod() === 'delete') {
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            if (is_array($input)) {
                foreach ($input as $key => $value) {
                    $body[$key] = $value;
                }
            } else {
                foreach ($_POST as $key => $value) {
                    $body[$key] = filter_input(INPUT_POST, $key, FILTER_SANITIZE_SPECIAL_CHARS);
                }
            }
        }
        return $body;
    }

    public function getHeaders() {
        return getallheaders();
    }

    public function getHeader($name) {
        $headers = $this->getHeaders();
        return $headers[$name] ?? $headers[strtolower($name)] ?? null;
    }
}
