<?php

namespace App\Traits;

trait ApiResponseTrait {
    protected function success($data = [], $message = 'Success', $code = 200) {
        header('Content-Type: application/json');
        http_response_code($code);
        echo json_encode([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }

    protected function error($message = 'Error', $code = 400, $data = []) {
        header('Content-Type: application/json');
        http_response_code($code);
        echo json_encode([
            'status' => 'error',
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }
}
