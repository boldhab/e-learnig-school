<?php

$config = require __DIR__ . '/../config/database.php';

try {
    $db = new PDO(
        "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}",
        $config['username'],
        $config['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // 1. Add PARENT role
    $db->exec("INSERT IGNORE INTO roles (id, role_name) VALUES (4, 'PARENT')");
    echo "PARENT role inserted/verified.\n";

    // 2. Create parent_student table
    $db->exec("CREATE TABLE IF NOT EXISTS parent_student (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_id INT NOT NULL,
        student_id INT NOT NULL,
        relationship_type ENUM('father', 'mother', 'guardian') DEFAULT 'guardian',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_parent_student (parent_id, student_id)
    )");
    echo "parent_student table created/verified.\n";

} catch (Exception $e) {
    echo "Migration Failed: " . $e->getMessage() . "\n";
}
