<?php
// Comprehensive test script for attendance system
require_once 'app/Core/Database.php';

echo "=== Attendance System Test ===\n\n";

try {
    $db = App\Core\Database::getInstance();
    $pdo = $db->getConnection();
    
    // Test 1: Check Required Tables
    echo "1. Checking required tables...\n";
    $requiredTables = ['users', 'roles', 'categories', 'teacher_assignments', 'attendance_records'];
    $tablesExist = true;
    
    foreach ($requiredTables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        $exists = $stmt->rowCount() > 0;
        echo "   - $table: " . ($exists ? "✓ EXISTS" : "✗ MISSING") . "\n";
        if (!$exists) $tablesExist = false;
    }
    
    if (!$tablesExist) {
        echo "\n✗ Some required tables are missing. Please run the database schema first.\n";
        exit;
    }
    
    // Test 2: Check Required Data
    echo "\n2. Checking required data...\n";
    $roleCount = $pdo->query("SELECT COUNT(*) FROM roles")->fetchColumn();
    $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $teacherCount = $pdo->query("SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.role_name = 'TEACHER'")->fetchColumn();
    $studentCount = $pdo->query("SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.id WHERE r.role_name = 'STUDENT'")->fetchColumn();
    $courseCount = $pdo->query("SELECT COUNT(*) FROM categories WHERE type IN ('Course', 'Subject')")->fetchColumn();
    $assignmentCount = $pdo->query("SELECT COUNT(*) FROM teacher_assignments")->fetchColumn();
    
    echo "   - Roles: $roleCount (need 3: ADMIN, TEACHER, STUDENT)\n";
    echo "   - Users: $userCount\n";
    echo "   - Teachers: $teacherCount\n";
    echo "   - Students: $studentCount\n";
    echo "   - Courses: $courseCount\n";
    echo "   - Teacher Assignments: $assignmentCount\n";
    
    if ($teacherCount === 0 || $studentCount === 0 || $courseCount === 0) {
        echo "\n✗ Missing required data. Please create users and courses first.\n";
        exit;
    }
    
    // Test 3: Test Attendance Repository
    echo "\n3. Testing Attendance Repository...\n";
    require_once 'app/Repositories/AttendanceRepository.php';
    $attendanceRepo = new App\Repositories\AttendanceRepository();
    
    // Test upsert
    $testData = [
        'student_id' => 1,
        'course_id' => 1,
        'teacher_id' => 1,
        'attendance_date' => date('Y-m-d'),
        'status' => 'present',
        'remarks' => 'Test record'
    ];
    
    try {
        $result = $attendanceRepo->upsertAttendance($testData);
        echo "   - Upsert attendance: ✓ SUCCESS\n";
    } catch (Exception $e) {
        echo "   - Upsert attendance: ✗ FAILED - " . $e->getMessage() . "\n";
    }
    
    // Test getCourseAttendance
    try {
        $attendance = $attendanceRepo->getCourseAttendance(1, date('Y-m-d'));
        echo "   - Get course attendance: ✓ SUCCESS (" . count($attendance) . " records)\n";
    } catch (Exception $e) {
        echo "   - Get course attendance: ✗ FAILED - " . $e->getMessage() . "\n";
    }
    
    // Test getStudentAttendance
    try {
        $records = $attendanceRepo->getStudentAttendance(1);
        echo "   - Get student attendance: ✓ SUCCESS (" . count($records) . " records)\n";
    } catch (Exception $e) {
        echo "   - Get student attendance: ✗ FAILED - " . $e->getMessage() . "\n";
    }
    
    // Test getStudentAttendanceSummary
    try {
        $summary = $attendanceRepo->getStudentAttendanceSummary(1);
        echo "   - Get student summary: ✓ SUCCESS\n";
        echo "     * Total: " . $summary['overall']['total'] . "\n";
        echo "     * Present: " . $summary['overall']['present'] . "\n";
        echo "     * Percentage: " . $summary['overall']['percentage'] . "%\n";
    } catch (Exception $e) {
        echo "   - Get student summary: ✗ FAILED - " . $e->getMessage() . "\n";
    }
    
    // Test 4: Test Attendance Service
    echo "\n4. Testing Attendance Service...\n";
    require_once 'app/Services/AttendanceService.php';
    
    try {
        $attendanceService = new App\Services\AttendanceService();
        
        $bulkData = [
            'course_id' => 1,
            'attendance_date' => date('Y-m-d'),
            'teacher_id' => 1,
            'records' => [
                ['student_id' => 1, 'status' => 'present', 'remarks' => 'Test bulk 1'],
                ['student_id' => 2, 'status' => 'late', 'remarks' => 'Test bulk 2']
            ]
        ];
        
        $result = $attendanceService->bulkMarkAttendance($bulkData);
        echo "   - Bulk mark attendance: ✓ SUCCESS\n";
        echo "     * Success count: " . $result['success_count'] . "\n";
        echo "     * Total records: " . $result['total_records'] . "\n";
        if (!empty($result['errors'])) {
            echo "     * Errors: " . implode('; ', $result['errors']) . "\n";
        }
    } catch (Exception $e) {
        echo "   - Bulk mark attendance: ✗ FAILED - " . $e->getMessage() . "\n";
    }
    
    // Test 5: Check API Routes Configuration
    echo "\n5. Checking API routes...\n";
    $apiFile = file_get_contents('routes/api.php');
    $requiredRoutes = [
        '/api/attendance/bulk' => 'AttendanceController::bulkMark',
        '/api/attendance/course' => 'AttendanceController::getCourseAttendance',
        '/api/attendance/student' => 'AttendanceController::getStudentAttendance'
    ];
    
    foreach ($requiredRoutes as $route => $method) {
        if (strpos($apiFile, $route) !== false) {
            echo "   - $route: ✓ CONFIGURED\n";
        } else {
            echo "   - $route: ✗ MISSING\n";
        }
    }
    
    // Test 6: Frontend API Configuration
    echo "\n6. Checking frontend API configuration...\n";
    $apiConfigFile = 'frontend/src/api/modules/attendance.api.js';
    if (file_exists($apiConfigFile)) {
        $apiConfig = file_get_contents($apiConfigFile);
        echo "   - attendance.api.js: ✓ EXISTS\n";
        
        if (strpos($apiConfig, 'bulkMark') !== false) {
            echo "   - bulkMark method: ✓ EXISTS\n";
        }
        if (strpos($apiConfig, 'getCourseAttendance') !== false) {
            echo "   - getCourseAttendance method: ✓ EXISTS\n";
        }
        if (strpos($apiConfig, 'getStudentAttendance') !== false) {
            echo "   - getStudentAttendance method: ✓ EXISTS\n";
        }
    } else {
        echo "   - attendance.api.js: ✗ MISSING\n";
    }
    
    echo "\n=== Test Summary ===\n";
    echo "Attendance system components have been tested.\n";
    echo "If all tests show ✓ SUCCESS, the system should be working properly.\n";
    echo "If you see ✗ FAILED, check the error messages and fix the issues.\n";
    
    echo "\n=== Next Steps ===\n";
    echo "1. Run 'php seed_attendance_data.php' to populate sample data\n";
    echo "2. Test the teacher attendance page in the frontend\n";
    echo "3. Test the student attendance page in the frontend\n";
    echo "4. Verify that attendance data flows correctly from frontend to backend\n";
    
} catch (Exception $e) {
    echo "✗ Test failed with error: " . $e->getMessage() . "\n";
}
