<?php
// Simple database connection check
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=millennium_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if attendance_records table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'attendance_records'");
    $tableExists = $stmt->rowCount() > 0;
    
    if ($tableExists) {
        echo "Table attendance_records exists\n";
        
        // Check table structure
        $stmt = $pdo->query("DESCRIBE attendance_records");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Table structure:\n";
        foreach ($columns as $col) {
            echo "- " . $col['Field'] . " (" . $col['Type'] . ")\n";
        }
        
        // Check if there's any data
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM attendance_records");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "\nTotal records: " . $count . "\n";
        
        if ($count > 0) {
            $stmt = $pdo->query("SELECT * FROM attendance_records LIMIT 5");
            $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "\nSample records:\n";
            foreach ($records as $record) {
                echo "ID: " . $record['id'] . ", Student: " . $record['student_id'] . ", Course: " . $record['course_id'] . ", Date: " . $record['attendance_date'] . ", Status: " . $record['status'] . "\n";
            }
        }
    } else {
        echo "Table attendance_records does not exist\n";
        
        // Check if we need to create it
        echo "\nCreating attendance_records table...\n";
        $sql = "CREATE TABLE IF NOT EXISTS attendance_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            course_id INT NOT NULL,
            teacher_id INT NOT NULL,
            attendance_date DATE NOT NULL,
            status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_attendance (student_id, course_id, attendance_date),
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id) REFERENCES categories(id) ON DELETE CASCADE,
            FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
        )";
        
        $pdo->exec($sql);
        echo "Table created successfully!\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
