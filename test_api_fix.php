<?php
// Test if RouterService error handling works

// Generate a valid JWT token for testing
$tokenPayload = [
    'id' => '1',
    'username' => 'admin',
    'role' => 'ADMIN'
];
$token = base64_encode(json_encode($tokenPayload));

echo "Testing API endpoints after fix...\n";
echo "==================================\n\n";

// Test 1: Unread count endpoint
echo "TEST 1: GET /api/notifications/unread-count\n";
$ch = curl_init('http://localhost/millinium/api/notifications/unread-count');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "Status: $httpCode\n";
echo "Response: " . substr($response, 0, 200) . "\n\n";

// Test 2: Notifications list endpoint
echo "TEST 2: GET /api/notifications\n";
$ch = curl_init('http://localhost/millinium/api/notifications');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "Status: $httpCode\n";
echo "Response: " . substr($response, 0, 200) . "\n\n";

// Test 3: Attendance student endpoint
echo "TEST 3: GET /api/attendance/student\n";
$ch = curl_init('http://localhost/millinium/api/attendance/student');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "Status: $httpCode\n";
echo "Response: " . substr($response, 0, 200) . "\n\n";

echo "==================================\n";
echo "✓ All tests completed\n";
echo "✓ Check status codes - should be 200, not 500\n";
?>
