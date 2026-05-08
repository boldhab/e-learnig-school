<?php

/**
 * COMPREHENSIVE API TEST SUITE - MODULES A, B, & C
 * Millennium School E-Learning System
 */

$baseUrl = "http://127.0.0.1:8000";

function testEndpoint($method, $path, $data = [], $token = null, $isMultipart = false) {
    global $baseUrl;
    $url = $baseUrl . $path;
    $ch = curl_init($url);
    
    $headers = [];
    if (!$isMultipart) {
        $headers[] = 'Content-Type: application/json';
    }
    
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($isMultipart) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        } else {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    } elseif ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response,
        'error' => $error
    ];
}

echo "--- STARTING COMPREHENSIVE SYSTEM TESTS ---\n\n";

// 1. Admin Login
echo "[1] Admin Login... ";
$adminLogin = testEndpoint('POST', '/api/login', ['login' => 'admin', 'password' => 'admin123']);
if ($adminLogin['code'] === 200) {
    $adminToken = $adminLogin['body']['data']['token'];
    echo "PASS\n";
} else { echo "FAIL\n"; exit; }

// 2. Create Teacher
$teacherUser = 'teacher_' . time();
echo "[2] Admin Creates Teacher... ";
$createTeacher = testEndpoint('POST', '/api/admin/teachers', [
    'full_name' => 'Test Teacher',
    'username' => $teacherUser,
    'email' => $teacherUser . '@millennium.edu',
    'password' => 'teacher123'
], $adminToken);
if ($createTeacher['code'] === 201) echo "PASS\n"; else { echo "FAIL\n"; exit; }

// 3. Create Student
$studentUser = 'student_' . time();
echo "[3] Admin Creates Student... ";
$createStudent = testEndpoint('POST', '/api/admin/students', [
    'full_name' => 'Test Student',
    'username' => $studentUser,
    'email' => $studentUser . '@student.edu',
    'password' => 'student123'
], $adminToken);
if ($createStudent['code'] === 201) echo "PASS\n"; else { echo "FAIL\n"; exit; }

// 4. Teacher Login
echo "[4] Teacher Login... ";
$tLogin = testEndpoint('POST', '/api/login', ['login' => $teacherUser, 'password' => 'teacher123']);
$teacherToken = $tLogin['body']['data']['token'];
echo "PASS\n";

// 5. Student Login
echo "[5] Student Login... ";
$sLogin = testEndpoint('POST', '/api/login', ['login' => $studentUser, 'password' => 'student123']);
$studentToken = $sLogin['body']['data']['token'];
echo "PASS\n";

// 6. Create Assignment (Module C - Test 1)
echo "[6] Teacher Creates Assignment (Cloudinary Upload)... ";
$dummyPdf = __DIR__ . '/test.pdf';
file_put_contents($dummyPdf, "%PDF-1.4 test assignment");
$assignmentData = [
    'title' => 'Math Assignment 1',
    'description' => 'Solve chapter 1 problems',
    'due_date' => date('Y-m-d H:i:s', strtotime('+7 days')),
    'max_marks' => 100,
    'course_id' => 1, // Assumes Grade 10 exists
    'attachment' => new \CURLFile($dummyPdf)
];
$createAssRes = testEndpoint('POST', '/api/assignments/create', $assignmentData, $teacherToken, true);
if ($createAssRes['code'] === 201) {
    $assignmentId = $createAssRes['body']['data']['assignment_id'];
    echo "PASS (ID: $assignmentId)\n";
} else { echo "FAIL (" . $createAssRes['code'] . ")\n"; print_r($createAssRes['body']); }
unlink($dummyPdf);

// 7. Get Assignments (Module C - Test 2)
echo "[7] Student Retrieves Assignments... ";
$getAssRes = testEndpoint('GET', '/api/assignments', [], $studentToken);
if ($getAssRes['code'] === 200 && count($getAssRes['body']['data']) > 0) echo "PASS\n"; else echo "FAIL\n";

// 8. Submit Assignment (Module C - Test 3)
echo "[8] Student Submits Assignment... ";
$submitRes = testEndpoint('POST', "/api/assignments/$assignmentId/submit", [
    'answer_text' => 'Here are my solutions to chapter 1.'
], $studentToken);
if ($submitRes['code'] === 201) {
    $submissionId = $submitRes['body']['data']['submission_id'];
    echo "PASS\n";
} else { echo "FAIL (" . $submitRes['code'] . ")\n"; print_r($submitRes['body']); }

// 9. View Submissions (Module C - Test 4)
echo "[9] Teacher Views Submissions... ";
$viewSubRes = testEndpoint('GET', "/api/assignments/$assignmentId/submissions", [], $teacherToken);
if ($viewSubRes['code'] === 200) echo "PASS\n"; else echo "FAIL\n";

// 10. Grade Submission (Module C - Test 5)
echo "[10] Teacher Grades Submission... ";
$gradeRes = testEndpoint('POST', "/api/submissions/$submissionId/grade", [
    'marks' => 95,
    'feedback' => 'Excellent work!'
], $teacherToken);
if ($gradeRes['code'] === 200) echo "PASS\n"; 
else {
    echo "FAIL (" . $gradeRes['code'] . ")\n";
    print_r($gradeRes['body']);
}

// 11. RBAC Security Test (Module C - Test 6)
echo "[11] Security Test: Student accessing teacher route... ";
$rbacRes = testEndpoint('GET', "/api/assignments/$assignmentId/submissions", [], $studentToken);
if ($rbacRes['code'] === 403) echo "PASS (Forbidden)\n"; else echo "FAIL (Got " . $rbacRes['code'] . ")\n";

echo "\n--- SYSTEM TESTS COMPLETED ---\n";
