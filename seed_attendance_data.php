<?php
// Script to seed sample attendance data for testing
require_once 'app/Core/Database.php';

try {
    $db = App\Core\Database::getInstance();
    $pdo = $db->getConnection();
    
    echo "=== Seeding Attendance Data ===\n";
    
    // Get sample students, teachers, and courses
    $students = $pdo->query("SELECT u.id, u.full_name, u.class_id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.role_name = 'STUDENT' LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
    $teachers = $pdo->query("SELECT u.id, u.full_name FROM users u JOIN roles r ON u.role_id = r.id WHERE r.role_name = 'TEACHER' LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    $courses = $pdo->query("SELECT c.id, c.name FROM categories c WHERE c.type IN ('Course', 'Subject') LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($students) || empty($teachers) || empty($courses)) {
        echo "Error: Not enough data to create attendance records. Please create users and courses first.\n";
        exit;
    }
    
    echo "Found " . count($students) . " students, " . count($teachers) . " teachers, " . count($courses) . " courses\n";
    
    // Clear existing attendance data
    $pdo->exec("DELETE FROM attendance_records");
    echo "Cleared existing attendance records\n";
    
    // Create attendance records for the last 30 days
    $statuses = ['present', 'absent', 'late'];
    $remarks = ['Good work', 'Needs improvement', 'Late arrival', 'Excellent participation', ''];
    
    $recordsCreated = 0;
    $startDate = date('Y-m-d', strtotime('-30 days'));
    $endDate = date('Y-m-d');
    
    foreach ($students as $student) {
        foreach ($courses as $course) {
            // Check if student is in a class that has this course
            $classCheck = $pdo->prepare("
                SELECT COUNT(*) FROM teacher_assignments ta 
                WHERE ta.course_id = ? AND ta.class_id = ?
            ");
            $classCheck->execute([$course['id'], $student['class_id']]);
            
            if ($classCheck->fetchColumn() == 0) {
                continue; // Skip if student's class doesn't have this course
            }
            
            // Get teacher for this course and class
            $teacherStmt = $pdo->prepare("
                SELECT ta.teacher_id FROM teacher_assignments ta 
                WHERE ta.course_id = ? AND ta.class_id = ? LIMIT 1
            ");
            $teacherStmt->execute([$course['id'], $student['class_id']]);
            $teacherAssignment = $teacherStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$teacherAssignment) {
                continue;
            }
            
            $teacherId = $teacherAssignment['teacher_id'];
            
            // Create attendance for each day
            $currentDate = $startDate;
            while ($currentDate <= $endDate) {
                // Skip weekends
                if (date('N', strtotime($currentDate)) >= 6) {
                    $currentDate = date('Y-m-d', strtotime($currentDate . ' +1 day'));
                    continue;
                }
                
                // Random status (80% present, 15% late, 5% absent)
                $rand = mt_rand(1, 100);
                if ($rand <= 80) {
                    $status = 'present';
                } elseif ($rand <= 95) {
                    $status = 'late';
                } else {
                    $status = 'absent';
                }
                
                $remark = $statuses[array_rand($remarks)];
                
                // Insert attendance record
                $stmt = $pdo->prepare("
                    INSERT INTO attendance_records 
                    (student_id, course_id, teacher_id, attendance_date, status, remarks) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $student['id'],
                    $course['id'],
                    $teacherId,
                    $currentDate,
                    $status,
                    $remark
                ]);
                
                $recordsCreated++;
                $currentDate = date('Y-m-d', strtotime($currentDate . ' +1 day'));
            }
        }
    }
    
    echo "Created $recordsCreated attendance records\n";
    
    // Show summary
    $totalRecords = $pdo->query("SELECT COUNT(*) FROM attendance_records")->fetchColumn();
    $presentCount = $pdo->query("SELECT COUNT(*) FROM attendance_records WHERE status = 'present'")->fetchColumn();
    $absentCount = $pdo->query("SELECT COUNT(*) FROM attendance_records WHERE status = 'absent'")->fetchColumn();
    $lateCount = $pdo->query("SELECT COUNT(*) FROM attendance_records WHERE status = 'late'")->fetchColumn();
    
    echo "\n=== Attendance Summary ===\n";
    echo "Total Records: $totalRecords\n";
    echo "Present: $presentCount (" . round($presentCount / $totalRecords * 100, 1) . "%)\n";
    echo "Absent: $absentCount (" . round($absentCount / $totalRecords * 100, 1) . "%)\n";
    echo "Late: $lateCount (" . round($lateCount / $totalRecords * 100, 1) . "%)\n";
    
    echo "\nSample records:\n";
    $sampleRecords = $pdo->query("
        SELECT ar.*, u.full_name as student_name, c.name as course_name 
        FROM attendance_records ar 
        JOIN users u ON ar.student_id = u.id 
        JOIN categories c ON ar.course_id = c.id 
        LIMIT 5
    ")->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($sampleRecords as $record) {
        echo "- {$record['student_name']} - {$record['course_name']} - {$record['attendance_date']} - {$record['status']}\n";
    }
    
    echo "\n=== Data seeding completed successfully! ===\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
