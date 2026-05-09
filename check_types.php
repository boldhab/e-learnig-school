<?php
$config = require 'config/database.php';
try {
    $pdo = new PDO("mysql:host={$config['host']};dbname={$config['database']}", $config['username'], $config['password']);
    $stmt = $pdo->query("SELECT DISTINCT type FROM categories");
    $types = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Category types:\n";
    print_r($types);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
