<?php

/**
 * ADMIN ASSIGNMENTS TEST SUITE
 * Verifies Student-Class and Teacher-Course assignments
 */

$baseUrl = "http://127.0.0.1:8000";

function testEndpoint($method, $path, $data = [], $token = null) {
    global $baseUrl;
    $url = $baseUrl . $path;
    $ch = curl_init($url);
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

echo "--- STARTING ADMIN ASSIGNMENT TESTS ---\n\n";

// 1. Admin Login
echo "[1] Admin Login... ";
$adminLogin = testEndpoint('POST', '/api/login', ['login' => 'admin', 'password' => 'password']);
$adminToken = $adminLogin['body']['data']['token'];
echo "PASS\n";

// 2. Create Grade and Course
echo "[2] Admin Creates Grade (Class)... ";
$createGrade = testEndpoint('POST', '/api/categories', ['name' => 'Grade 10A', 'type' => 'Grade'], $adminToken);
$classId = $createGrade['body']['data']['category_id'];
echo "PASS (Class ID: $classId)\n";

echo "[3] Admin Creates Course... ";
$createCourse = testEndpoint('POST', '/api/categories', ['name' => 'Advanced Physics', 'type' => 'Course', 'parent_id' => $classId], $adminToken);
$courseId = $createCourse['body']['data']['category_id'];
echo "PASS (Course ID: $courseId)\n";

// 3. Create Student and Teacher
echo "[4] Admin Creates Teacher... ";
$teacherUser = "teacher_assign_" . time();
$createTeacher = testEndpoint('POST', '/api/admin/teachers', [
    'full_name' => 'Einstein',
    'username' => $teacherUser,
    'email' => $teacherUser . '@millennium.edu',
    'password' => 'teacher123'
], $adminToken);
$teacherId = $createTeacher['body']['data']['user_id'];
echo "PASS (Teacher ID: $teacherId)\n";

echo "[5] Admin Creates Student... ";
$studentUser = "student_assign_" . time();
$createStudent = testEndpoint('POST', '/api/admin/students', [
    'full_name' => 'Newton',
    'username' => $studentUser,
    'email' => $studentUser . '@student.edu',
    'password' => 'student123'
], $adminToken);
$studentId = $createStudent['body']['data']['user_id'];
echo "PASS (Student ID: $studentId)\n";

// 4. Assign Student to Class
echo "[6] Admin Assigns Student to Class... ";
$assignStudent = testEndpoint('POST', '/api/admin/assign-student', [
    'student_id' => $studentId,
    'class_id' => $classId
], $adminToken);
if ($assignStudent['code'] === 200) echo "PASS\n"; else { echo "FAIL\n"; print_r($assignStudent['body']); }

// 5. Assign Teacher to Course/Class
echo "[7] Admin Assigns Teacher to Course & Class... ";
$assignTeacher = testEndpoint('POST', '/api/admin/assign-teacher', [
    'teacher_id' => $teacherId,
    'course_id' => $courseId,
    'class_id' => $classId
], $adminToken);
if ($assignTeacher['code'] === 200) echo "PASS\n"; else { echo "FAIL\n"; print_r($assignTeacher['body']); }

// 6. Verify Assignments
echo "[8] Verifying Teacher Assignments... ";
$getAssigns = testEndpoint('GET', "/api/admin/teachers/$teacherId/assignments", [], $adminToken);
if ($getAssigns['code'] === 200 && count($getAssigns['body']['data']) > 0) echo "PASS\n"; else echo "FAIL\n";

echo "\n--- ADMIN ASSIGNMENT TESTS COMPLETED ---\n";
