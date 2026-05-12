<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Services\CourseService;
use Exception;

class CourseController extends BaseController {
    protected $courseService;

    public function __construct() {
        $this->courseService = new CourseService();
    }

    public function list(Request $request, Response $response) {
        $this->requireAuth();
        $user = $GLOBALS['auth_user'];
        $courses = $this->courseService->getUserCourses($user['id'], $user['role_name']);
        $this->success($courses);
    }

    public function students(Request $request, Response $response, $id) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        try {
            $classId = isset($_GET['class_id']) ? (int)$_GET['class_id'] : null;
            $students = $this->courseService->getCourseStudents((int)$id, $classId);
            $this->success($students);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function dashboard(Request $request, Response $response) {
        $this->requireRole('TEACHER');

        try {
            $teacherId = (int) $GLOBALS['auth_user']['id'];
            $db = Database::getInstance();
            $courses = $this->courseService->getUserCourses($teacherId, 'TEACHER');

            $studentRoleStmt = $db->query("SELECT id FROM roles WHERE role_name = 'STUDENT' LIMIT 1");
            $studentRoleId = (int) $studentRoleStmt->fetchColumn();

            $summary = [
                'active_sections' => count($courses),
                'enrolled_students' => 0,
                'pending_submissions' => 0,
                'materials_uploaded' => 0,
            ];

            $enrolledStmt = $db->prepare(<<<SQL
SELECT COUNT(DISTINCT u.id)
FROM users u
INNER JOIN teacher_assignments ta ON ta.class_id = u.class_id
WHERE ta.teacher_id = :teacher_id
  AND u.role_id = :student_role_id
SQL);
            $enrolledStmt->execute([
                'teacher_id' => $teacherId,
                'student_role_id' => $studentRoleId,
            ]);
            $summary['enrolled_students'] = (int) $enrolledStmt->fetchColumn();

            $materialsStmt = $db->prepare(<<<SQL
SELECT COUNT(DISTINCT m.id)
FROM materials m
INNER JOIN teacher_assignments ta ON ta.course_id = m.subject_id AND ta.class_id = m.class_id
WHERE ta.teacher_id = :teacher_id
  AND m.uploaded_by = :uploaded_by
  AND m.status = 'active'
SQL);
            $materialsStmt->execute([
                'teacher_id' => $teacherId,
                'uploaded_by' => $teacherId
            ]);
            $summary['materials_uploaded'] = (int) $materialsStmt->fetchColumn();

            $pendingStmt = $db->prepare(<<<SQL
SELECT COUNT(DISTINCT s.id)
FROM submissions s
INNER JOIN assignments a ON a.id = s.assignment_id
INNER JOIN users u ON u.id = s.student_id
INNER JOIN teacher_assignments ta ON ta.course_id = a.course_id AND ta.class_id = u.class_id
WHERE ta.teacher_id = :teacher_id
  AND a.created_by = :created_by
  AND s.status = 'pending'
SQL);
            $pendingStmt->execute([
                'teacher_id' => $teacherId,
                'created_by' => $teacherId
            ]);
            $summary['pending_submissions'] = (int) $pendingStmt->fetchColumn();

            $queueStmt = $db->prepare(<<<SQL
SELECT
    s.id AS submission_id,
    s.submitted_at,
    s.status,
    a.title AS assignment_title,
    a.due_date,
    c.name AS course_name,
    cl.name AS class_name,
    u.full_name AS student_name,
    a.max_marks,
    COALESCE(g.marks, NULL) AS marks
FROM submissions s
INNER JOIN assignments a ON a.id = s.assignment_id
INNER JOIN categories c ON c.id = a.course_id
INNER JOIN users u ON u.id = s.student_id
INNER JOIN teacher_assignments ta ON ta.course_id = a.course_id AND ta.class_id = u.class_id
INNER JOIN categories cl ON cl.id = ta.class_id
LEFT JOIN grades g ON g.submission_id = s.id
WHERE ta.teacher_id = :teacher_id
  AND a.created_by = :created_by
  AND s.status = 'pending'
ORDER BY s.submitted_at ASC
LIMIT 5
SQL);
            $queueStmt->execute([
                'teacher_id' => $teacherId,
                'created_by' => $teacherId
            ]);
            $gradingQueue = $queueStmt->fetchAll();

            $recentSubmissionsStmt = $db->prepare(<<<SQL
SELECT
    s.submitted_at AS timestamp,
    'submission' AS type,
    u.full_name AS actor,
    a.title AS title,
    c.name AS course_name,
    CONCAT('submitted ', a.title, ' in ', c.name) AS details
FROM submissions s
INNER JOIN assignments a ON a.id = s.assignment_id
INNER JOIN categories c ON c.id = a.course_id
INNER JOIN users u ON u.id = s.student_id
INNER JOIN teacher_assignments ta ON ta.course_id = a.course_id AND ta.class_id = u.class_id
WHERE ta.teacher_id = :teacher_id
  AND a.created_by = :created_by
ORDER BY s.submitted_at DESC
LIMIT 5
SQL);
            $recentSubmissionsStmt->execute([
                'teacher_id' => $teacherId,
                'created_by' => $teacherId
            ]);
            $recentSubmissions = $recentSubmissionsStmt->fetchAll();

            $recentMaterialsStmt = $db->prepare(<<<SQL
SELECT
    m.created_at AS timestamp,
    'material' AS type,
    u.full_name AS actor,
    m.title AS title,
    c.name AS course_name,
    CONCAT('uploaded ', m.title, ' for ', c.name, ' / ', cl.name) AS details
FROM materials m
INNER JOIN users u ON u.id = m.uploaded_by
INNER JOIN categories c ON c.id = m.subject_id
INNER JOIN categories cl ON cl.id = m.class_id
WHERE m.uploaded_by = :teacher_id
  AND m.status = 'active'
ORDER BY m.created_at DESC
LIMIT 5
SQL);
            $recentMaterialsStmt->execute(['teacher_id' => $teacherId]);
            $recentMaterials = $recentMaterialsStmt->fetchAll();

            $recentAssignmentsStmt = $db->prepare(<<<SQL
SELECT
    a.created_at AS timestamp,
    'assignment' AS type,
    u.full_name AS actor,
    a.title AS title,
    c.name AS course_name,
    CONCAT('created ', a.title, ' in ', c.name) AS details
FROM assignments a
INNER JOIN users u ON u.id = a.created_by
INNER JOIN categories c ON c.id = a.course_id
WHERE a.created_by = :teacher_id
ORDER BY a.created_at DESC
LIMIT 5
SQL);
            $recentAssignmentsStmt->execute(['teacher_id' => $teacherId]);
            $recentAssignments = $recentAssignmentsStmt->fetchAll();

            $recentAttendanceStmt = $db->prepare(<<<SQL
SELECT DISTINCT
    ar.created_at AS timestamp,
    'attendance' AS type,
    u.full_name AS actor,
    c.name AS course_name,
    cl.name AS class_name,
    CONCAT('marked attendance for ', cl.name, ' - ', c.name) AS details
FROM attendance_records ar
INNER JOIN users u ON u.id = ar.teacher_id
INNER JOIN categories c ON c.id = ar.course_id
INNER JOIN users s ON s.id = ar.student_id
INNER JOIN categories cl ON cl.id = s.class_id
WHERE ar.teacher_id = :teacher_id
ORDER BY ar.created_at DESC
LIMIT 5
SQL);
            $recentAttendanceStmt->execute(['teacher_id' => $teacherId]);
            $recentAttendance = $recentAttendanceStmt->fetchAll();

            $recentActivity = array_merge($recentSubmissions, $recentMaterials, $recentAssignments, $recentAttendance);
            usort($recentActivity, function ($left, $right) {
                return strtotime($right['timestamp']) <=> strtotime($left['timestamp']);
            });
            $recentActivity = array_slice($recentActivity, 0, 8);

            $this->success([
                'summary' => $summary,
                'courses' => $courses,
                'grading_queue' => $gradingQueue,
                'recent_activity' => $recentActivity,
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
