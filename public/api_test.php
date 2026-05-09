<?php
header('Content-Type: application/json');
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=millennium_db', 'root', '');
    echo json_encode(['db_status' => 'connected', 'message' => 'MySQL is running and accessible']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['db_status' => 'error', 'message' => $e->getMessage()]);
}
exit;
