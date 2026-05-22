USE millennium_db;
INSERT IGNORE INTO roles (id, role_name) VALUES (4, 'PARENT');
CREATE TABLE IF NOT EXISTS parent_student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship_type ENUM('father', 'mother', 'guardian') DEFAULT 'guardian',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_student (parent_id, student_id)
);
