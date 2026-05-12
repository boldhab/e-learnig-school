<?php
require_once 'app/Core/Database.php';

try {
    $db = App\Core\Database::getInstance();
    $pdo = $db->getConnection();
    
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
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
