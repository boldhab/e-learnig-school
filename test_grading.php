<?php
require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

require __DIR__ . '/app/Core/Database.php';
require __DIR__ . '/app/Services/MailService.php';
require __DIR__ . '/app/Services/NotificationService.php';
require __DIR__ . '/app/Repositories/NotificationRepository.php';
require __DIR__ . '/app/Repositories/GradeRepository.php';
require __DIR__ . '/app/Repositories/SubmissionRepository.php';
require __DIR__ . '/app/Services/GradingService.php';

use App\Core\Database;
use App\Services\GradingService;

$db = Database::getInstance();

// Insert a fake parent, student, assignment, submission to ensure we have one to test with.
// First, a fake student
$db->exec("INSERT INTO users (username, email, password, full_name, role_id, status) VALUES ('test_student', 'student@example.com', 'test', 'Test Student', 4, 'active') ON DUPLICATE KEY UPDATE id=id");
$studentId = $db->query("SELECT id FROM users WHERE email = 'student@example.com'")->fetchColumn();

// Fake parent
$db->exec("INSERT INTO users (username, email, password, full_name, role_id, status) VALUES ('test_parent', 'parent@example.com', 'test', 'Test Parent', 5, 'active') ON DUPLICATE KEY UPDATE id=id");
$parentId = $db->query("SELECT id FROM users WHERE email = 'parent@example.com'")->fetchColumn();

// Link parent and student
$db->exec("INSERT IGNORE INTO parent_student (parent_id, student_id) VALUES ($parentId, $studentId)");

// Fake course and assignment
$db->exec("INSERT INTO categories (name, type) VALUES ('Test Course', 'Course') ON DUPLICATE KEY UPDATE id=id");
$courseId = $db->query("SELECT id FROM categories WHERE name = 'Test Course' AND type = 'Course'")->fetchColumn();

$db->exec("INSERT INTO assignments (title, max_marks, created_by, course_id) VALUES ('Test Assignment', 100, 1, $courseId) ON DUPLICATE KEY UPDATE id=id");
$assignmentId = $db->query("SELECT id FROM assignments WHERE title = 'Test Assignment'")->fetchColumn();

// Fake submission
$db->exec("INSERT INTO submissions (assignment_id, student_id, status) VALUES ($assignmentId, $studentId, 'pending') ON DUPLICATE KEY UPDATE id=id");
$submissionId = $db->query("SELECT id FROM submissions WHERE assignment_id = $assignmentId AND student_id = $studentId")->fetchColumn();

echo "Submission ID to grade: $submissionId\n";

$gradingService = new GradingService();
try {
    $gradingService->gradeSubmission($submissionId, 95, 'Great work!', 1);
    echo "Graded successfully!\n";
} catch (Exception $e) {
    echo "Error grading: " . $e->getMessage() . "\n";
}
