<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=millennium_db', 'root', '');
$hash = password_hash('12345678', PASSWORD_BCRYPT);

// Check if role 1 exists
$stmt = $pdo->prepare("SELECT id FROM roles WHERE role_name = 'ADMIN'");
$stmt->execute();
$role = $stmt->fetch();
$roleId = $role ? $role['id'] : 1;

$stmt = $pdo->prepare("INSERT INTO users (full_name, username, email, password, role_id, status) VALUES ('Hab Admin', 'habadmin', 'hab@admin.com', ?, ?, 'active') ON DUPLICATE KEY UPDATE password = ?, role_id = ?");
$stmt->execute([$hash, $roleId, $hash, $roleId]);

echo "Admin user added successfully.\n";
