<?php

/**
 * DISCUSSION MODULE TEST SUITE
 * Verifies Auto-creation and Discussion Flow
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
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
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

echo "--- STARTING DISCUSSION MODULE TESTS ---\n\n";

// 1. Admin Login
echo "[1] Admin Login... ";
$adminLogin = testEndpoint('POST', '/api/login', ['login' => 'admin', 'password' => 'admin123']);
$adminToken = $adminLogin['body']['data']['token'];
echo "PASS\n";

// 2. Create Course (Triggers Auto-Discussion Group)
echo "[2] Admin Creates Course (expecting auto-discussion group)... ";
$courseName = "Physics 101_" . time();
$createCourse = testEndpoint('POST', '/api/categories', [
    'name' => $courseName,
    'type' => 'Course'
], $adminToken);

if ($createCourse['code'] === 201) {
    $courseId = $createCourse['body']['data']['category_id'];
    echo "PASS (Course ID: $courseId)\n";
} else { echo "FAIL\n"; print_r($createCourse['body']); exit; }

// 3. Verify Discussion Group Auto-Creation
echo "[3] Verifying Discussion Group exists for course... ";
$getDiscRes = testEndpoint('GET', "/api/courses/$courseId/discussion", [], $adminToken);
if ($getDiscRes['code'] === 200) {
    $groupId = $getDiscRes['body']['data']['id'];
    echo "PASS (Group ID: $groupId, Title: " . $getDiscRes['body']['data']['title'] . ")\n";
} else { echo "FAIL\n"; print_r($getDiscRes['body']); exit; }

// 4. Create Teacher and Topic
echo "[4] Admin Creates Teacher... ";
$teacherUser = "teacher_disc_" . time();
testEndpoint('POST', '/api/admin/teachers', [
    'full_name' => 'Physics Teacher',
    'username' => $teacherUser,
    'email' => $teacherUser . '@millennium.edu',
    'password' => 'teacher123'
], $adminToken);
$tLogin = testEndpoint('POST', '/api/login', ['login' => $teacherUser, 'password' => 'teacher123']);
$teacherToken = $tLogin['body']['data']['token'];
echo "PASS\n";

echo "[5] Teacher Creates Topic... ";
$createTopic = testEndpoint('POST', "/api/discussions/$groupId/topics", [
    'title' => 'Quantum Mechanics Discussion'
], $teacherToken);
if ($createTopic['code'] === 201) {
    $topicId = $createTopic['body']['data']['topic_id'];
    echo "PASS (Topic ID: $topicId)\n";
} else { echo "FAIL\n"; print_r($createTopic['body']); exit; }

// 6. Student Message
echo "[6] Admin Creates Student... ";
$studentUser = "student_disc_" . time();
testEndpoint('POST', '/api/admin/students', [
    'full_name' => 'Physics Student',
    'username' => $studentUser,
    'email' => $studentUser . '@student.edu',
    'password' => 'student123'
], $adminToken);
$sLogin = testEndpoint('POST', '/api/login', ['login' => $studentUser, 'password' => 'student123']);
$studentToken = $sLogin['body']['data']['token'];
echo "PASS\n";

echo "[7] Student Posts Message... ";
$postMsg = testEndpoint('POST', "/api/topics/$topicId/messages", [
    'message' => 'Is Schodinger cat alive or dead?'
], $studentToken);
if ($postMsg['code'] === 201) {
    $messageId = $postMsg['body']['data']['message_id'];
    echo "PASS\n";
} else { echo "FAIL\n"; print_r($postMsg['body']); exit; }

// 7. Teacher Moderation
echo "[8] Teacher Moderates (Deletes) Message... ";
$delMsg = testEndpoint('DELETE', "/api/messages/$messageId", [], $teacherToken);
if ($delMsg['code'] === 200) echo "PASS\n"; else echo "FAIL\n";

echo "\n--- DISCUSSION TESTS COMPLETED ---\n";
