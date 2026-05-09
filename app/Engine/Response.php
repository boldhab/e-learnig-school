<?php

namespace App\Engine;

class Response {
    public function setStatusCode(int $code) {
        http_response_code($code);
    }

    public function json($data, $status = 'success', $message = '', $code = 200) {
        $this->setStatusCode($code);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => $status,
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }
}
