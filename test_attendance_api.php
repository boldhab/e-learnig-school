<?php
// Test script to check attendance API endpoints
require_once 'app/Core/Database.php';

try {
    $db = App\Core\Database::getInstance();
    $pdo = $db->getConnection();
    
    echo "=== Database Connection Test ===\n";
    echo "Connected successfully to database\n\n";
    
    echo "=== Tables Check ===\n";
    $tables = ['users', 'categories', 'attendance_records', 'teacher_assignments', 'roles'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        $exists = $stmt->rowCount() > 0;
        echo "- $table: " . ($exists ? "EXISTS" : "MISSING") . "\n";
    }
    
    echo "\n=== Sample Data Check ===\n";
    
    // Check users
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $userCount = $stmt->fetch()['count'];
    echo "Total users: $userCount\n";
    
    // Check teachers
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.role_name = 'TEACHER'");
    $teacherCount = $stmt->fetch()['count'];
    echo "Teachers: $teacherCount\n";
    
    // Check students
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users u JOIN roles r ON u.role_id = r.id WHERE r.role_name = 'STUDENT'");
    $studentCount = $stmt->fetch()['count'];
    echo "Students: $studentCount\n";
    
    // Check courses
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM categories WHERE type IN ('Course', 'Subject')");
    $courseCount = $stmt->fetch()['count'];
    echo "Courses: $courseCount\n";
    
    // Check teacher assignments
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM teacher_assignments");
    $assignmentCount = $stmt->fetch()['count'];
    echo "Teacher assignments: $assignmentCount\n";
    
    // Check attendance records
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM attendance_records");
    $attendanceCount = $stmt->fetch()['count'];
    echo "Attendance records: $attendanceCount\n";
    
    if ($attendanceCount > 0) {
        echo "\n=== Sample Attendance Records ===\n";
        $stmt = $pdo->query("SELECT ar.*, u.full_name as student_name, c.name as course_name FROM attendance_records ar JOIN users u ON ar.student_id = u.id JOIN categories c ON ar.course_id = c.id LIMIT 5");
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($records as $record) {
            echo "ID: {$record['id']}, Student: {$record['student_name']}, Course: {$record['course_name']}, Date: {$record['attendance_date']}, Status: {$record['status']}\n";
        }
    }
    
    echo "\n=== API Route Test ===\n";
    echo "Checking if attendance routes are properly configured...\n";
    
    // Check if the attendance routes file contains the required routes
    $apiFile = file_get_contents('routes/api.php');
    $requiredRoutes = [
        '/api/attendance/bulk',
        '/api/attendance/course',
        '/api/attendance/student'
    ];
    
    foreach ($requiredRoutes as $route) {
        if (strpos($apiFile, $route) !== false) {
            echo "- $route: CONFIGURED\n";
        } else {
            echo "- $route: MISSING\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
