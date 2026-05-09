<?php
$config = require 'config/database.php';
try {
    $pdo = new PDO("mysql:host={$config['host']};dbname={$config['database']}", $config['username'], $config['password']);
    $stmt = $pdo->query("SELECT id, role_name FROM roles");
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Roles in database:\n";
    print_r($roles);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
