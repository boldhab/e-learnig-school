<?php

require __DIR__ . '/../app/Core/Database.php';
require __DIR__ . '/../app/Repositories/UserRepository.php';
require __DIR__ . '/../app/Repositories/ParentRepository.php';
require __DIR__ . '/../app/Services/UserService.php';

use App\Services\UserService;

try {
    $userService = new UserService();
    $studentData = [
        'full_name' => 'Test Student',
        'username' => 'test_student_' . rand(1, 1000),
        'email' => 'student' . rand(1, 1000) . '@test.com',
        'password' => 'password123',
        'parent_name' => 'Test Parent',
        'parent_email' => 'parent' . rand(1, 1000) . '@test.com',
        'parent_password' => 'password123',
        'relationship_type' => 'mother'
    ];

    $studentId = $userService->createStudent($studentData);
    echo "Student created with ID: $studentId\n";

    $db = \App\Core\Database::getInstance();
    $stmt = $db->prepare("SELECT p.id as parent_id, p.full_name as parent_name FROM users p JOIN parent_student ps ON ps.parent_id = p.id WHERE ps.student_id = ?");
    $stmt->execute([$studentId]);
    $parent = $stmt->fetch();

    if ($parent) {
        echo "Parent linked successfully! Parent ID: " . $parent['parent_id'] . " | Name: " . $parent['parent_name'] . "\n";
    } else {
        echo "Failed to link parent.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
