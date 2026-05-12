<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\UserService;
use App\Services\AdminService;
use App\Core\Validation;
use App\Helpers\HtmlSanitizer;
use Exception;

class AdminController extends BaseController {
    protected $userService;
    protected $adminService;
    protected $validation;

    public function __construct() {
        $this->userService = new UserService();
        $this->adminService = new AdminService();
        $this->validation = new Validation();
    }

    private function ensureAcademicTables($db) {
        $db->exec("CREATE TABLE IF NOT EXISTS department_teacher_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            department_id INT NOT NULL,
            teacher_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_teacher_department (teacher_id),
            UNIQUE KEY unique_department_teacher (department_id, teacher_id),
            FOREIGN KEY (department_id) REFERENCES categories(id) ON DELETE CASCADE,
            FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $db->exec("CREATE TABLE IF NOT EXISTS class_course_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            department_id INT,
            class_id INT NOT NULL,
            course_id INT NOT NULL,
            teacher_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_class_course (class_id, course_id),
            FOREIGN KEY (class_id) REFERENCES categories(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id) REFERENCES categories(id) ON DELETE CASCADE,
            FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $db->exec("CREATE TABLE IF NOT EXISTS course_teacher_pool (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            teacher_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_course_teacher (course_id, teacher_id),
            FOREIGN KEY (course_id) REFERENCES categories(id) ON DELETE CASCADE,
            FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    }

    public function createStudent(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        if (!$this->validation->validate($data, [
            'full_name' => 'required',
            'username' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6'
        ])) {
            $this->error('Validation failed', 422, $this->validation->getErrors());
        }

        try {
            $id = $this->userService->createStudent($data);
            if (!empty($data['class_id'])) {
                $this->adminService->assignStudentToClass($id, $data['class_id']);
            }
            $this->success(['user_id' => $id], 'Student created and assigned successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function createTeacher(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        if (!$this->validation->validate($data, [
            'full_name' => 'required',
            'username' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6'
        ])) {
            $this->error('Validation failed', 422, $this->validation->getErrors());
        }

        try {
            $id = $this->userService->createTeacher($data);
            $classIds = $data['class_ids'] ?? (!empty($data['class_id']) ? [$data['class_id']] : []);
            if (!empty($data['course_id']) && !empty($classIds)) {
                $this->adminService->assignTeacherToCourse($id, $data['course_id'], $classIds);
            }
            $this->success(['user_id' => $id], 'Teacher created and assigned successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getAllUsers(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $users = $this->userService->getAllUsers();
        $this->success($users);
    }

    public function updateUser(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        if (empty($data['id'])) $this->error('ID is required');
        
        try {
            $id = $data['id'];
            unset($data['id']); // Don't update ID
            $this->userService->updateUser($id, $data);
            $this->success([], 'User updated successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function deleteUser(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = $request->getBody();
        if (empty($data['id'])) $this->error('ID is required');
        
        try {
            $db = \App\Core\Database::getInstance();
            $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$data['id']]);
            $this->success([], 'User deleted successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function resetPassword(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = $request->getBody();
        if (empty($data['id']) || empty($data['password'])) {
            $this->error('ID and new password are required', 422);
        }
        
        try {
            $this->userService->updateUser($data['id'], ['password' => $data['password']]);
            $this->success([], 'Password reset successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function changeUserStatus(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        if (!isset($data['id']) || !isset($data['status'])) {
            $this->error('ID and status are required', 422);
        }

        try {
            $this->userService->updateUser($data['id'], ['status' => $data['status']]);
            $this->success([], 'User status updated successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function assignStudent(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        if (empty($data['student_id']) || empty($data['class_id'])) {
            $this->error('Student ID and Class ID are required', 422);
        }
        try {
            $this->adminService->assignStudentToClass($data['student_id'], $data['class_id']);
            $this->success([], 'Student assigned to class successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function assignTeacher(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());
        $classIds = $data['class_ids'] ?? (!empty($data['class_id']) ? [$data['class_id']] : []);

        if (empty($data['teacher_id']) || empty($data['course_id']) || empty($classIds)) {
            $this->error('Teacher ID, Course ID, and at least one Class ID are required', 422);
        }
        try {
            $this->adminService->assignTeacherToCourse($data['teacher_id'], $data['course_id'], $classIds);
            $this->success([], 'Teacher assigned to course and class successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getTeacherAssignments(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');
        $assignments = $this->adminService->getTeacherAssignments($id);
        $this->success($assignments);
    }

    public function getStats(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        try {
            $stats = $this->adminService->getSchoolStats();
            $this->success($stats);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getLogs(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        try {
            $logs = $this->adminService->getRecentLogs();
            $this->success($logs);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getDetailedLogs(Request $request, Response $response) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();
            $params = $request->getBody();

            $limit = isset($params['limit']) ? (int) $params['limit'] : 100;
            if ($limit <= 0) {
                $limit = 100;
            }
            if ($limit > 250) {
                $limit = 250;
            }

            $logs = [];

            $loginStmt = $db->prepare(" 
                SELECT
                    l.login_time AS timestamp,
                    u.full_name AS user,
                    'User login' AS action,
                    'Authentication' AS module,
                    l.ip_address AS ip,
                    'Success' AS status
                FROM login_logs l
                INNER JOIN users u ON u.id = l.user_id
                ORDER BY l.login_time DESC
                LIMIT ?
            ");
            $loginStmt->bindValue(1, $limit, \PDO::PARAM_INT);
            $loginStmt->execute();
            $logs = array_merge($logs, $loginStmt->fetchAll());

            $userCreateStmt = $db->prepare(" 
                SELECT
                    u.created_at AS timestamp,
                    'System' AS user,
                    CONCAT('Created user account: ', u.full_name) AS action,
                    'User Management' AS module,
                    NULL AS ip,
                    'Success' AS status
                FROM users u
                ORDER BY u.created_at DESC
                LIMIT ?
            ");
            $userCreateStmt->bindValue(1, $limit, \PDO::PARAM_INT);
            $userCreateStmt->execute();
            $logs = array_merge($logs, $userCreateStmt->fetchAll());

            $materialStmt = $db->prepare(" 
                SELECT
                    m.created_at AS timestamp,
                    u.full_name AS user,
                    CONCAT('Uploaded material: ', m.title) AS action,
                    'Materials' AS module,
                    NULL AS ip,
                    'Success' AS status
                FROM materials m
                INNER JOIN users u ON u.id = m.uploaded_by
                ORDER BY m.created_at DESC
                LIMIT ?
            ");
            $materialStmt->bindValue(1, $limit, \PDO::PARAM_INT);
            $materialStmt->execute();
            $logs = array_merge($logs, $materialStmt->fetchAll());

            $assignmentStmt = $db->prepare(" 
                SELECT
                    a.created_at AS timestamp,
                    u.full_name AS user,
                    CONCAT('Created assignment: ', a.title) AS action,
                    'Assignments' AS module,
                    NULL AS ip,
                    'Success' AS status
                FROM assignments a
                INNER JOIN users u ON u.id = a.created_by
                ORDER BY a.created_at DESC
                LIMIT ?
            ");
            $assignmentStmt->bindValue(1, $limit, \PDO::PARAM_INT);
            $assignmentStmt->execute();
            $logs = array_merge($logs, $assignmentStmt->fetchAll());

            $warningStmt = $db->prepare(" 
                SELECT
                    n.created_at AS timestamp,
                    u.full_name AS user,
                    n.title AS action,
                    'Notifications' AS module,
                    NULL AS ip,
                    'Warning' AS status
                FROM notifications n
                INNER JOIN users u ON u.id = n.user_id
                WHERE n.priority = 'high' OR n.type = 'warning'
                ORDER BY n.created_at DESC
                LIMIT ?
            ");
            $warningStmt->bindValue(1, $limit, \PDO::PARAM_INT);
            $warningStmt->execute();
            $logs = array_merge($logs, $warningStmt->fetchAll());

            usort($logs, function ($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });

            $logs = array_slice($logs, 0, $limit);

            $formatted = array_map(function ($log) {
                return [
                    'timestamp' => $log['timestamp'],
                    'user' => $log['user'] ?: 'Unknown',
                    'action' => $log['action'] ?: 'Activity',
                    'module' => $log['module'] ?: 'System',
                    'ip' => $log['ip'] ?: '-',
                    'status' => $log['status'] ?: 'Success',
                ];
            }, $logs);

            $this->success($formatted);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getClasses(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        try {
            $db = \App\Core\Database::getInstance();
            $requiredGrades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
            $existingGrades = $db->query("SELECT id, name FROM categories WHERE type = 'Grade' ORDER BY name ASC")->fetchAll();
            $existingNames = array_map(function ($grade) {
                return strtolower(trim($grade['name']));
            }, $existingGrades);

            $insertStmt = $db->prepare("INSERT INTO categories (name, type, parent_id) VALUES (?, 'Grade', NULL)");
            foreach ($requiredGrades as $gradeName) {
                if (!in_array(strtolower($gradeName), $existingNames, true)) {
                    $insertStmt->execute([$gradeName]);
                }
            }

            $classes = $db->query("\n                SELECT\n                    g.id,\n                    g.name,\n                    (SELECT COUNT(*)\n                        FROM users u\n                        WHERE u.class_id = g.id\n                          AND u.role_id = (SELECT id FROM roles WHERE role_name = 'STUDENT' LIMIT 1)\n                    ) AS students_count,\n                    (SELECT COUNT(*)\n                        FROM teacher_assignments ta\n                        WHERE ta.class_id = g.id\n                    ) AS teacher_assignments_count\n                FROM categories g\n                WHERE g.type = 'Grade'\n                ORDER BY g.name ASC\n            ")->fetchAll();
            $this->success($classes);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function createClass(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());

        if (empty($data['name'])) {
            $this->error('Class name is required', 422);
        }

        try {
            $db = \App\Core\Database::getInstance();
            $stmt = $db->prepare("INSERT INTO categories (name, type, parent_id) VALUES (:name, 'Grade', NULL)");
            $stmt->execute(['name' => $data['name']]);
            $classId = (int) $db->lastInsertId();

            $studentIds = $data['student_ids'] ?? [];
            if (is_array($studentIds)) {
                foreach ($studentIds as $studentId) {
                    if (!empty($studentId)) {
                        $this->adminService->assignStudentToClass((int) $studentId, $classId);
                    }
                }
            }

            $this->success(['class_id' => $classId], 'Class created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function updateClass(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');
        $data = HtmlSanitizer::sanitize($request->getBody());

        if (empty($data['name'])) {
            $this->error('Class name is required', 422);
        }

        try {
            $db = \App\Core\Database::getInstance();
            $stmt = $db->prepare("UPDATE categories SET name = :name WHERE id = :id AND type = 'Grade'");
            $stmt->execute([
                'id' => (int) $id,
                'name' => $data['name'],
            ]);

            if (array_key_exists('student_ids', $data)) {
                $studentIds = is_array($data['student_ids']) ? array_map('intval', $data['student_ids']) : [];
                $studentIds = array_values(array_filter($studentIds, fn ($studentId) => $studentId > 0));

                $currentStudentStmt = $db->prepare("SELECT id FROM users WHERE class_id = :class_id AND role_id = (SELECT id FROM roles WHERE role_name = 'STUDENT' LIMIT 1)");
                $currentStudentStmt->execute(['class_id' => (int) $id]);
                $currentStudentIds = array_map('intval', $currentStudentStmt->fetchAll(\PDO::FETCH_COLUMN));

                foreach (array_diff($currentStudentIds, $studentIds) as $studentId) {
                    $this->userService->updateUser($studentId, ['class_id' => null]);
                }

                foreach ($studentIds as $studentId) {
                    $this->adminService->assignStudentToClass($studentId, (int) $id);
                }
            }

            $this->success([], 'Class updated successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function deleteClass(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();

            $materialCountStmt = $db->prepare("SELECT COUNT(*) FROM materials WHERE class_id = ?");
            $materialCountStmt->execute([(int) $id]);
            if ((int) $materialCountStmt->fetchColumn() > 0) {
                $this->error('This class still has uploaded materials. Reassign or remove them before deleting the class.', 422);
            }

            $studentStmt = $db->prepare("UPDATE users SET class_id = NULL WHERE class_id = ?");
            $studentStmt->execute([(int) $id]);

            $db->prepare("DELETE FROM teacher_assignments WHERE class_id = ?")->execute([(int) $id]);
            $db->prepare("DELETE FROM categories WHERE id = ? AND type = 'Grade'")->execute([(int) $id]);

            $this->success([], 'Class deleted successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function deleteCourse(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();

            // Check if course has any assignments
            $assignmentStmt = $db->prepare("SELECT COUNT(*) FROM assignments WHERE course_id = ?");
            $assignmentStmt->execute([(int) $id]);
            if ((int) $assignmentStmt->fetchColumn() > 0) {
                $this->error('This course has assignments. Remove them before deleting the course.', 422);
            }

            // Delete teacher assignments for this course
            $db->prepare("DELETE FROM teacher_assignments WHERE course_id = ?")->execute([(int) $id]);

            // Delete the course category
            $db->prepare("DELETE FROM categories WHERE id = ? AND type = 'Course'")->execute([(int) $id]);

            $this->success([], 'Course deleted successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getClassDetails(Request $request, Response $response, $classId) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();

            // Get class info
            $classStmt = $db->prepare("SELECT id, name FROM categories WHERE id = ? AND type = 'Grade'");
            $classStmt->execute([(int) $classId]);
            $classData = $classStmt->fetch();

            if (!$classData) {
                $this->error('Class not found', 404);
            }

            // Get students in this class
            $studentRoleStmt = $db->prepare("SELECT id FROM roles WHERE role_name = 'STUDENT' LIMIT 1");
            $studentRoleStmt->execute();
            $studentRoleId = (int) $studentRoleStmt->fetchColumn();

            $studentsStmt = $db->prepare("
                SELECT u.id, u.full_name, u.student_id, u.email
                FROM users u
                WHERE u.class_id = ? AND u.role_id = ? AND u.status = 'active'
                ORDER BY u.full_name ASC
            ");
            $studentsStmt->execute([(int) $classId, $studentRoleId]);
            $students = $studentsStmt->fetchAll();

            // Get assigned courses and teachers for this class
            $coursesStmt = $db->prepare("
                SELECT
                    cca.id,
                    cca.course_id,
                    cca.teacher_id,
                    c.name AS course_name,
                    u.full_name AS teacher_name
                FROM class_course_assignments cca
                INNER JOIN categories c ON c.id = cca.course_id
                INNER JOIN users u ON u.id = cca.teacher_id
                WHERE cca.class_id = ?
                ORDER BY c.name ASC
            ");
            $coursesStmt->execute([(int) $classId]);
            $assignedCourses = $coursesStmt->fetchAll();

            $this->success([
                'class' => $classData,
                'students' => $students,
                'assigned_courses' => $assignedCourses
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getAvailableStudentsForClass(Request $request, Response $response, $classId) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();

            $classStmt = $db->prepare("SELECT id, name FROM categories WHERE id = ? AND type = 'Grade' LIMIT 1");
            $classStmt->execute([(int) $classId]);
            $classRow = $classStmt->fetch();

            if (!$classRow) {
                $this->error('Class not found', 404);
            }

            $studentRoleStmt = $db->prepare("SELECT id FROM roles WHERE role_name = 'STUDENT' LIMIT 1");
            $studentRoleStmt->execute();
            $studentRoleId = (int) $studentRoleStmt->fetchColumn();

            $studentsStmt = $db->prepare("
                SELECT u.id, u.full_name, u.student_id, u.email
                FROM users u
                WHERE u.role_id = ?
                  AND u.status = 'active'
                  AND (u.class_id IS NULL OR u.class_id = 0)
                ORDER BY u.full_name ASC
            ");
            $studentsStmt->execute([$studentRoleId]);
            $availableStudents = $studentsStmt->fetchAll();

            $this->success([
                'class' => [
                    'id' => (int) $classRow['id'],
                    'name' => $classRow['name'],
                ],
                'students' => $availableStudents,
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function removeStudentFromClass(Request $request, Response $response, $classId) {
        $this->requireRole('ADMIN');

        try {
            $data = $request->getBody();
            if (empty($data['student_id'])) {
                $this->error('Student ID is required', 400);
            }

            $db = \App\Core\Database::getInstance();
            $studentId = (int) $data['student_id'];
            $classId = (int) $classId;

            // Verify the student is actually in this class
            $checkStmt = $db->prepare("SELECT id FROM users WHERE id = ? AND class_id = ?");
            $checkStmt->execute([$studentId, $classId]);
            if (!$checkStmt->fetch()) {
                $this->error('Student is not assigned to this class', 404);
            }

            // Unassign the student
            $updateStmt = $db->prepare("UPDATE users SET class_id = NULL WHERE id = ?");
            $updateStmt->execute([$studentId]);

            $this->success([], 'Student removed from class successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getAcademicDepartments(Request $request, Response $response) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();
            $this->ensureAcademicTables($db);

            $teacherRoleStmt = $db->prepare("SELECT id FROM roles WHERE role_name = 'TEACHER' LIMIT 1");
            $teacherRoleStmt->execute();
            $teacherRoleId = (int) $teacherRoleStmt->fetchColumn();

            // All active teachers
            $allTeachersStmt = $db->prepare("
                SELECT u.id, u.full_name
                FROM users u
                WHERE u.role_id = ? AND u.status = 'active'
                ORDER BY u.full_name ASC
            ");
            $allTeachersStmt->execute([$teacherRoleId]);
            $allTeachers = $allTeachersStmt->fetchAll();

            // All courses with their teacher pools
            $allCourses = $db->query("
                SELECT id, name
                FROM categories
                WHERE type IN ('Course', 'Subject')
                ORDER BY name ASC
            ")->fetchAll();

            $courseTeacherStmt = $db->prepare("
                SELECT u.id, u.full_name
                FROM course_teacher_pool ctp
                INNER JOIN users u ON u.id = ctp.teacher_id
                WHERE ctp.course_id = ?
                ORDER BY u.full_name ASC
            ");
            foreach ($allCourses as &$course) {
                $courseTeacherStmt->execute([(int) $course['id']]);
                $course['teachers'] = $courseTeacherStmt->fetchAll();
            }
            unset($course);

            // All classes (Grade) with their assigned courses
            $allClasses = $db->query("
                SELECT id, name
                FROM categories
                WHERE type = 'Grade'
                ORDER BY name ASC
            ")->fetchAll();

            $assignedCoursesStmt = $db->prepare("
                SELECT
                    cca.id,
                    cca.course_id,
                    cca.teacher_id,
                    c.name AS course_name,
                    u.full_name AS teacher_name,
                    g.name AS class_name
                FROM class_course_assignments cca
                INNER JOIN categories c ON c.id = cca.course_id
                INNER JOIN users u ON u.id = cca.teacher_id
                INNER JOIN categories g ON g.id = cca.class_id
                WHERE cca.class_id = ?
                ORDER BY c.name ASC
            ");
            foreach ($allClasses as &$classRow) {
                $assignedCoursesStmt->execute([(int) $classRow['id']]);
                $classRow['assigned_courses'] = $assignedCoursesStmt->fetchAll();
            }
            unset($classRow);

            $this->success([
                'all_teachers' => $allTeachers,
                'all_courses' => $allCourses,
                'all_classes' => $allClasses,
                // Keep legacy keys for backward compatibility
                'available_teachers' => $allTeachers,
                'departments' => [],
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function createDepartment(Request $request, Response $response) {
        $this->requireRole('ADMIN');

        try {
            $data = HtmlSanitizer::sanitize($request->getBody());
            $name = trim((string) ($data['name'] ?? ''));
            if ($name === '') {
                $this->error('Department name is required', 422);
            }

            $db = \App\Core\Database::getInstance();
            $this->ensureAcademicTables($db);

            $existsStmt = $db->prepare(" 
                SELECT id
                FROM categories
                WHERE type = 'Subject' AND parent_id IS NULL AND LOWER(name) = LOWER(?)
                LIMIT 1
            ");
            $existsStmt->execute([$name]);
            if ($existsStmt->fetch()) {
                $this->error('Department already exists', 422);
            }

            $stmt = $db->prepare("INSERT INTO categories (name, type, parent_id) VALUES (?, 'Subject', NULL)");
            $stmt->execute([$name]);

            $this->success(['department_id' => (int) $db->lastInsertId()], 'Department created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function assignTeacherToDepartment(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');

        try {
            $data = HtmlSanitizer::sanitize($request->getBody());
            $teacherId = (int) ($data['teacher_id'] ?? 0);
            $departmentId = (int) $id;

            if ($teacherId <= 0) {
                $this->error('Teacher ID is required', 422);
            }

            $db = \App\Core\Database::getInstance();
            $this->ensureAcademicTables($db);

            $departmentStmt = $db->prepare("SELECT id FROM categories WHERE id = ? AND type = 'Subject' AND parent_id IS NULL LIMIT 1");
            $departmentStmt->execute([$departmentId]);
            if (!$departmentStmt->fetch()) {
                $this->error('Department not found', 404);
            }

            $teacherStmt = $db->prepare(" 
                SELECT u.id
                FROM users u
                INNER JOIN roles r ON r.id = u.role_id
                WHERE u.id = ? AND r.role_name = 'TEACHER'
                LIMIT 1
            ");
            $teacherStmt->execute([$teacherId]);
            if (!$teacherStmt->fetch()) {
                $this->error('Teacher not found', 404);
            }

            $alreadyAssignedStmt = $db->prepare("SELECT department_id FROM department_teacher_assignments WHERE teacher_id = ? LIMIT 1");
            $alreadyAssignedStmt->execute([$teacherId]);
            $existing = $alreadyAssignedStmt->fetch();
            if ($existing && (int) $existing['department_id'] !== $departmentId) {
                $this->error('Teacher is already assigned to another department', 422);
            }

            $assignStmt = $db->prepare("INSERT IGNORE INTO department_teacher_assignments (department_id, teacher_id) VALUES (?, ?)");
            $assignStmt->execute([$departmentId, $teacherId]);

            $this->success([], 'Teacher assigned to department successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function createDepartmentClass(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');

        try {
            $data = HtmlSanitizer::sanitize($request->getBody());
            $classId = (int) ($data['class_id'] ?? 0);
            $name = trim((string) ($data['name'] ?? ''));
            $departmentId = (int) $id;

            if ($classId <= 0 && $name === '') {
                $this->error('Select a class or provide a class name', 422);
            }

            $db = \App\Core\Database::getInstance();
            $this->ensureAcademicTables($db);

            $departmentStmt = $db->prepare("SELECT id FROM categories WHERE id = ? AND type = 'Subject' AND parent_id IS NULL LIMIT 1");
            $departmentStmt->execute([$departmentId]);
            if (!$departmentStmt->fetch()) {
                $this->error('Department not found', 404);
            }

            if ($classId > 0) {
                $classStmt = $db->prepare("SELECT id, parent_id FROM categories WHERE id = ? AND type = 'Grade' LIMIT 1");
                $classStmt->execute([$classId]);
                $classRow = $classStmt->fetch();

                if (!$classRow) {
                    $this->error('Class not found', 404);
                }

                if (!empty($classRow['parent_id']) && (int) $classRow['parent_id'] !== $departmentId) {
                    $this->error('Class is already assigned to another department', 422);
                }

                if ((int) $classRow['parent_id'] === $departmentId) {
                    $this->success(['class_id' => (int) $classRow['id']], 'Class already linked to this department');
                }

                $linkStmt = $db->prepare("UPDATE categories SET parent_id = ? WHERE id = ? AND type = 'Grade'");
                $linkStmt->execute([$departmentId, $classId]);

                $this->success(['class_id' => $classId], 'Class linked to department successfully');
            }

            $existsStmt = $db->prepare(" 
                SELECT id
                FROM categories
                WHERE type = 'Grade' AND parent_id = ? AND LOWER(name) = LOWER(?)
                LIMIT 1
            ");
            $existsStmt->execute([$departmentId, $name]);
            if ($existsStmt->fetch()) {
                $this->error('Grade/Class already exists in this department', 422);
            }

            $stmt = $db->prepare("INSERT INTO categories (name, type, parent_id) VALUES (?, 'Grade', ?)");
            $stmt->execute([$name, $departmentId]);

            $this->success(['class_id' => (int) $db->lastInsertId()], 'Grade/Class created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function assignCourseToClass(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');

        try {
            $data = HtmlSanitizer::sanitize($request->getBody());
            $classId = (int) $id;
            $teacherId = (int) ($data['teacher_id'] ?? 0);
            $courseId = isset($data['course_id']) ? (int) $data['course_id'] : 0;

            if ($teacherId <= 0 || $courseId <= 0) {
                $this->error('Course and teacher are required', 422);
            }

            $db = \App\Core\Database::getInstance();
            $this->ensureAcademicTables($db);

            $classStmt = $db->prepare("SELECT id FROM categories WHERE id = ? AND type = 'Grade' LIMIT 1");
            $classStmt->execute([$classId]);
            if (!$classStmt->fetch()) {
                $this->error('Class not found', 404);
            }

            $courseStmt = $db->prepare("SELECT id FROM categories WHERE id = ? AND type = 'Course' LIMIT 1");
            $courseStmt->execute([$courseId]);
            if (!$courseStmt->fetch()) {
                $this->error('Course not found', 404);
            }

            // Validate teacher is in the course's teacher pool
            $poolStmt = $db->prepare("SELECT id FROM course_teacher_pool WHERE course_id = ? AND teacher_id = ? LIMIT 1");
            $poolStmt->execute([$courseId, $teacherId]);
            if (!$poolStmt->fetch()) {
                $this->error('Selected teacher is not assigned to this course', 422);
            }

            $duplicateStmt = $db->prepare("SELECT id FROM class_course_assignments WHERE class_id = ? AND course_id = ? LIMIT 1");
            $duplicateStmt->execute([$classId, $courseId]);
            if ($duplicateStmt->fetch()) {
                $this->error('This course is already assigned to the selected class', 422);
            }

            $insertStmt = $db->prepare("INSERT INTO class_course_assignments (department_id, class_id, course_id, teacher_id) VALUES (NULL, ?, ?, ?)");
            $insertStmt->execute([$classId, $courseId, $teacherId]);

            // Keep legacy teacher_assignments in sync for existing analytics/pages.
            $db->prepare("DELETE FROM teacher_assignments WHERE class_id = ? AND course_id = ?")->execute([$classId, $courseId]);
            $legacyInsertStmt = $db->prepare("INSERT INTO teacher_assignments (teacher_id, course_id, class_id) VALUES (?, ?, ?)");
            $legacyInsertStmt->execute([$teacherId, $courseId, $classId]);

            $this->success([], 'Course assigned to class successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getCourses(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        try {
            $db = \App\Core\Database::getInstance();
            $courses = $db->query("SELECT id, name FROM categories WHERE type = 'Course' OR type = 'Subject'")->fetchAll();
            $this->success($courses);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function createCourse(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        try {
            $data = HtmlSanitizer::sanitize($request->getBody());
            $name = trim((string) ($data['name'] ?? ''));
            $teacherIds = isset($data['teacher_ids']) && is_array($data['teacher_ids'])
                ? array_map('intval', $data['teacher_ids'])
                : [];

            if ($name === '') {
                $this->error('Course name is required', 422);
            }

            $db = \App\Core\Database::getInstance();
            $this->ensureAcademicTables($db);

            $existsStmt = $db->prepare("SELECT id FROM categories WHERE type = 'Course' AND LOWER(name) = LOWER(?) LIMIT 1");
            $existsStmt->execute([$name]);
            if ($existsStmt->fetch()) {
                $this->error('A course with this name already exists', 422);
            }

            $insertStmt = $db->prepare("INSERT INTO categories (name, type, parent_id) VALUES (?, 'Course', NULL)");
            $insertStmt->execute([$name]);
            $courseId = (int) $db->lastInsertId();

            if (!empty($teacherIds)) {
                $poolStmt = $db->prepare("INSERT IGNORE INTO course_teacher_pool (course_id, teacher_id) VALUES (?, ?)");
                foreach ($teacherIds as $tid) {
                    if ($tid > 0) {
                        $poolStmt->execute([$courseId, $tid]);
                    }
                }
            }

            $this->success(['course_id' => $courseId], 'Course created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getCourseTeachers(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');
        try {
            $db = \App\Core\Database::getInstance();
            $this->ensureAcademicTables($db);
            $courseId = (int) $id;

            $stmt = $db->prepare("
                SELECT u.id, u.full_name
                FROM course_teacher_pool ctp
                INNER JOIN users u ON u.id = ctp.teacher_id
                WHERE ctp.course_id = ?
                ORDER BY u.full_name ASC
            ");
            $stmt->execute([$courseId]);
            $this->success($stmt->fetchAll());
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function createStandaloneClass(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        try {
            $data = HtmlSanitizer::sanitize($request->getBody());
            $name = trim((string) ($data['name'] ?? ''));
            if ($name === '') {
                $this->error('Class name is required', 422);
            }

            $db = \App\Core\Database::getInstance();
            $this->ensureAcademicTables($db);

            $existsStmt = $db->prepare("SELECT id FROM categories WHERE type = 'Grade' AND LOWER(name) = LOWER(?) LIMIT 1");
            $existsStmt->execute([$name]);
            if ($existsStmt->fetch()) {
                $this->error('A class with this name already exists', 422);
            }

            $stmt = $db->prepare("INSERT INTO categories (name, type, parent_id) VALUES (?, 'Grade', NULL)");
            $stmt->execute([$name]);
            $this->success(['class_id' => (int) $db->lastInsertId()], 'Class created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getCourseDetails(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();
            $courseId = (int) $id;
            $params = $request->getBody();
            $classId = isset($params['class_id']) ? (int) $params['class_id'] : null;

            $courseStmt = $db->prepare("SELECT id, name, type FROM categories WHERE id = ? AND type IN ('Course', 'Subject') LIMIT 1");
            $courseStmt->execute([$courseId]);
            $course = $courseStmt->fetch();

            if (!$course) {
                $this->error('Course or subject not found', 404);
            }

            $whereClassSql = '';
            $whereClassParams = [$courseId];
            if (!empty($classId)) {
                $whereClassSql = ' AND ta.class_id = ?';
                $whereClassParams[] = $classId;
            }

            $assignmentStmt = $db->prepare("
                SELECT
                    ta.id AS assignment_id,
                    ta.class_id,
                    cl.name AS class_name,
                    ta.teacher_id,
                    u.full_name AS teacher_name,
                    ta.created_at,
                    (
                        SELECT COUNT(*)
                        FROM users s
                        INNER JOIN roles sr ON sr.id = s.role_id
                        WHERE sr.role_name = 'STUDENT'
                          AND s.class_id = ta.class_id
                    ) AS students_in_class
                FROM teacher_assignments ta
                INNER JOIN users u ON u.id = ta.teacher_id
                INNER JOIN categories cl ON cl.id = ta.class_id
                WHERE ta.course_id = ? $whereClassSql
                ORDER BY ta.created_at DESC
            ");
            $assignmentStmt->execute($whereClassParams);
            $teacherAssignments = $assignmentStmt->fetchAll();

            $teacherIds = array_values(array_unique(array_map(function ($row) {
                return (int) $row['teacher_id'];
            }, $teacherAssignments)));

            $materialWhereSql = 'm.subject_id = ?';
            $materialParams = [$courseId];
            if (!empty($classId)) {
                $materialWhereSql .= ' AND m.class_id = ?';
                $materialParams[] = $classId;
            }

            $materialCountStmt = $db->prepare("SELECT COUNT(*) FROM materials m WHERE $materialWhereSql");
            $materialCountStmt->execute($materialParams);
            $materialCount = (int) $materialCountStmt->fetchColumn();

            $materialListStmt = $db->prepare("
                SELECT m.title, m.created_at, u.full_name AS uploaded_by
                FROM materials m
                INNER JOIN users u ON u.id = m.uploaded_by
                WHERE $materialWhereSql
                ORDER BY m.created_at DESC
                LIMIT 5
            ");
            $materialListStmt->execute($materialParams);
            $recentMaterials = $materialListStmt->fetchAll();

            $assignmentCountStmt = $db->prepare("SELECT COUNT(*) FROM assignments WHERE course_id = ?");
            $assignmentCountStmt->execute([$courseId]);
            $assignmentCount = (int) $assignmentCountStmt->fetchColumn();

            $recentAssignmentsStmt = $db->prepare("
                SELECT a.id, a.title, a.due_date, a.created_at, u.full_name AS created_by
                FROM assignments a
                INNER JOIN users u ON u.id = a.created_by
                WHERE a.course_id = ?
                ORDER BY a.created_at DESC
                LIMIT 5
            ");
            $recentAssignmentsStmt->execute([$courseId]);
            $recentAssignments = $recentAssignmentsStmt->fetchAll();

            $announcementStmt = $db->prepare("SELECT COUNT(*) FROM announcements WHERE course_id = ?");
            $announcementStmt->execute([$courseId]);
            $announcementCount = (int) $announcementStmt->fetchColumn();

            $discussionStatsStmt = $db->prepare("
                SELECT
                    COUNT(DISTINCT dg.id) AS groups_count,
                    COUNT(DISTINCT dt.id) AS topics_count,
                    COUNT(DISTINCT dm.id) AS messages_count
                FROM discussion_groups dg
                LEFT JOIN discussion_topics dt ON dt.group_id = dg.id
                LEFT JOIN discussion_messages dm ON dm.topic_id = dt.id
                WHERE dg.course_id = ?
            ");
            $discussionStatsStmt->execute([$courseId]);
            $discussionStats = $discussionStatsStmt->fetch() ?: [
                'groups_count' => 0,
                'topics_count' => 0,
                'messages_count' => 0,
            ];

            $attendanceWhereSql = 'ar.course_id = ?';
            $attendanceParams = [$courseId];
            if (!empty($classId)) {
                $attendanceWhereSql .= ' AND s.class_id = ?';
                $attendanceParams[] = $classId;
            }

            $attendanceStmt = $db->prepare("
                SELECT
                    COUNT(*) AS total_records,
                    SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) AS present_records,
                    SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) AS absent_records,
                    SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) AS late_records,
                    MAX(ar.attendance_date) AS last_marked_date
                FROM attendance_records ar
                INNER JOIN users s ON s.id = ar.student_id
                WHERE $attendanceWhereSql
            ");
            $attendanceStmt->execute($attendanceParams);
            $attendanceStats = $attendanceStmt->fetch() ?: [
                'total_records' => 0,
                'present_records' => 0,
                'absent_records' => 0,
                'late_records' => 0,
                'last_marked_date' => null,
            ];

            $teacherActivity = [
                'materials_uploaded' => 0,
                'assignments_created' => 0,
                'attendance_marked' => 0,
                'recent_actions' => [],
            ];

            if (!empty($teacherIds)) {
                $teacherPlaceholders = implode(',', array_fill(0, count($teacherIds), '?'));

                $materialTeacherSql = "
                    SELECT COUNT(*)
                    FROM materials m
                    WHERE m.subject_id = ?
                      AND m.uploaded_by IN ($teacherPlaceholders)
                ";
                $materialTeacherParams = array_merge([$courseId], $teacherIds);
                if (!empty($classId)) {
                    $materialTeacherSql .= ' AND m.class_id = ?';
                    $materialTeacherParams[] = $classId;
                }
                $materialTeacherStmt = $db->prepare($materialTeacherSql);
                $materialTeacherStmt->execute($materialTeacherParams);
                $teacherActivity['materials_uploaded'] = (int) $materialTeacherStmt->fetchColumn();

                $assignmentTeacherStmt = $db->prepare("SELECT COUNT(*) FROM assignments WHERE course_id = ? AND created_by IN ($teacherPlaceholders)");
                $assignmentTeacherStmt->execute(array_merge([$courseId], $teacherIds));
                $teacherActivity['assignments_created'] = (int) $assignmentTeacherStmt->fetchColumn();

                $attendanceTeacherSql = "
                    SELECT COUNT(*)
                    FROM attendance_records ar
                    INNER JOIN users s ON s.id = ar.student_id
                    WHERE ar.course_id = ?
                      AND ar.teacher_id IN ($teacherPlaceholders)
                ";
                $attendanceTeacherParams = array_merge([$courseId], $teacherIds);
                if (!empty($classId)) {
                    $attendanceTeacherSql .= ' AND s.class_id = ?';
                    $attendanceTeacherParams[] = $classId;
                }
                $attendanceTeacherStmt = $db->prepare($attendanceTeacherSql);
                $attendanceTeacherStmt->execute($attendanceTeacherParams);
                $teacherActivity['attendance_marked'] = (int) $attendanceTeacherStmt->fetchColumn();

                $actionLimit = 8;

                $materialActionsSql = "
                    SELECT
                        m.created_at AS action_time,
                        CONCAT(u.full_name, ' uploaded material: ', m.title) AS action_label
                    FROM materials m
                    INNER JOIN users u ON u.id = m.uploaded_by
                    WHERE m.subject_id = ?
                      AND m.uploaded_by IN ($teacherPlaceholders)
                ";
                $materialActionsParams = array_merge([$courseId], $teacherIds);
                if (!empty($classId)) {
                    $materialActionsSql .= ' AND m.class_id = ?';
                    $materialActionsParams[] = $classId;
                }
                $materialActionsSql .= ' ORDER BY m.created_at DESC LIMIT ' . $actionLimit;
                $materialActionsStmt = $db->prepare($materialActionsSql);
                $materialActionsStmt->execute($materialActionsParams);
                $materialActions = $materialActionsStmt->fetchAll();

                $assignmentActionsStmt = $db->prepare("
                    SELECT
                        a.created_at AS action_time,
                        CONCAT(u.full_name, ' created assignment: ', a.title) AS action_label
                    FROM assignments a
                    INNER JOIN users u ON u.id = a.created_by
                    WHERE a.course_id = ?
                      AND a.created_by IN ($teacherPlaceholders)
                    ORDER BY a.created_at DESC
                    LIMIT $actionLimit
                ");
                $assignmentActionsStmt->execute(array_merge([$courseId], $teacherIds));
                $assignmentActions = $assignmentActionsStmt->fetchAll();

                $attendanceActionsSql = "
                    SELECT
                        MAX(ar.created_at) AS action_time,
                        CONCAT(u.full_name, ' marked attendance for ', COUNT(*), ' student records on ', DATE(ar.attendance_date)) AS action_label
                    FROM attendance_records ar
                    INNER JOIN users u ON u.id = ar.teacher_id
                    INNER JOIN users s ON s.id = ar.student_id
                    WHERE ar.course_id = ?
                      AND ar.teacher_id IN ($teacherPlaceholders)
                ";
                $attendanceActionsParams = array_merge([$courseId], $teacherIds);
                if (!empty($classId)) {
                    $attendanceActionsSql .= ' AND s.class_id = ?';
                    $attendanceActionsParams[] = $classId;
                }
                $attendanceActionsSql .= ' GROUP BY ar.teacher_id, ar.attendance_date ORDER BY action_time DESC LIMIT ' . $actionLimit;
                $attendanceActionsStmt = $db->prepare($attendanceActionsSql);
                $attendanceActionsStmt->execute($attendanceActionsParams);
                $attendanceActions = $attendanceActionsStmt->fetchAll();

                $recentActions = array_merge($materialActions, $assignmentActions, $attendanceActions);
                usort($recentActions, function ($a, $b) {
                    return strtotime($b['action_time']) - strtotime($a['action_time']);
                });
                $teacherActivity['recent_actions'] = array_slice($recentActions, 0, $actionLimit);
            }

            $this->success([
                'course' => [
                    'id' => (int) $course['id'],
                    'name' => $course['name'],
                    'type' => $course['type'],
                    'class_id' => !empty($classId) ? $classId : null,
                ],
                'teacher_assignments' => $teacherAssignments,
                'teacher_activity' => $teacherActivity,
                'stats' => [
                    'materials' => $materialCount,
                    'assignments' => $assignmentCount,
                    'announcements' => $announcementCount,
                    'discussion_groups' => (int) ($discussionStats['groups_count'] ?? 0),
                    'discussion_topics' => (int) ($discussionStats['topics_count'] ?? 0),
                    'discussion_messages' => (int) ($discussionStats['messages_count'] ?? 0),
                    'attendance_total_records' => (int) ($attendanceStats['total_records'] ?? 0),
                    'attendance_present_records' => (int) ($attendanceStats['present_records'] ?? 0),
                    'attendance_absent_records' => (int) ($attendanceStats['absent_records'] ?? 0),
                    'attendance_late_records' => (int) ($attendanceStats['late_records'] ?? 0),
                    'last_attendance_marked_date' => $attendanceStats['last_marked_date'] ?? null,
                ],
                'recent_materials' => $recentMaterials,
                'recent_assignments' => $recentAssignments,
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getCoursesOverview(Request $request, Response $response) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();

            $summary = [
                'total_courses' => (int) $db->query("SELECT COUNT(*) FROM categories WHERE type = 'Course'")->fetchColumn(),
                'total_subjects' => (int) $db->query("SELECT COUNT(*) FROM categories WHERE type = 'Subject'")->fetchColumn(),
                'total_grades' => (int) $db->query("SELECT COUNT(*) FROM categories WHERE type = 'Grade'")->fetchColumn(),
                'assigned_teachers' => (int) $db->query("SELECT COUNT(DISTINCT teacher_id) FROM teacher_assignments")->fetchColumn(),
                'active_sections' => (int) $db->query("SELECT COUNT(DISTINCT class_id) FROM teacher_assignments")->fetchColumn(),
                'auto_groups' => (int) $db->query("SELECT COUNT(*) FROM discussion_groups")->fetchColumn(),
            ];

            $hierarchy = [
                [
                    'title' => 'Grades',
                    'detail' => 'Junior and senior secondary structure',
                    'count' => $summary['total_grades'],
                ],
                [
                    'title' => 'Subjects',
                    'detail' => 'Core and elective subject map',
                    'count' => $summary['total_subjects'],
                ],
                [
                    'title' => 'Sections',
                    'detail' => 'Class groups and enrollment buckets',
                    'count' => $summary['active_sections'],
                ],
            ];

            $gradeLevels = $db->query("SELECT id, name FROM categories WHERE type = 'Grade' ORDER BY name ASC")->fetchAll();

            $assignmentRows = $db->query("
                SELECT
                    ta.id AS assignment_id,
                    ta.class_id,
                    cl.name AS class_name,
                    ta.course_id,
                    c.name AS course_name,
                    c.type AS course_type,
                    u.full_name AS teacher_name,
                    (
                        SELECT COUNT(*)
                        FROM users s
                        INNER JOIN roles sr ON sr.id = s.role_id
                        WHERE sr.role_name = 'STUDENT'
                          AND s.class_id = ta.class_id
                    ) AS student_count
                FROM teacher_assignments ta
                INNER JOIN categories c ON c.id = ta.course_id
                INNER JOIN categories cl ON cl.id = ta.class_id
                INNER JOIN users u ON u.id = ta.teacher_id
                WHERE c.type IN ('Course', 'Subject')
                ORDER BY cl.name ASC, c.name ASC
            ")->fetchAll();

            $levels = [];
            foreach ($gradeLevels as $grade) {
                $levels[$grade['id']] = [
                    'id' => (int) $grade['id'],
                    'name' => $grade['name'],
                    'courses' => [],
                ];
            }

            foreach ($assignmentRows as $row) {
                if (!isset($levels[$row['class_id']])) {
                    continue;
                }

                $levels[$row['class_id']]['courses'][] = [
                    'assignment_id' => (int) $row['assignment_id'],
                    'course_id' => (int) $row['course_id'],
                    'class_id' => (int) $row['class_id'],
                    'code' => 'CAT-' . $row['course_id'],
                    'title' => $row['course_name'],
                    'type' => $row['course_type'],
                    'section' => $row['class_name'],
                    'teacher' => $row['teacher_name'],
                    'students' => (int) $row['student_count'],
                ];
            }

            $assignedCourseIds = array_map(function ($row) {
                return (int) $row['course_id'];
            }, $assignmentRows);

            $unassignedCourseRows = [];
            if (!empty($assignedCourseIds)) {
                $placeholders = implode(',', array_fill(0, count($assignedCourseIds), '?'));
                $stmt = $db->prepare("SELECT id, name, type FROM categories WHERE type IN ('Course', 'Subject') AND id NOT IN ($placeholders) ORDER BY name ASC");
                $stmt->execute($assignedCourseIds);
                $unassignedCourseRows = $stmt->fetchAll();
            } else {
                $unassignedCourseRows = $db->query("SELECT id, name, type FROM categories WHERE type IN ('Course', 'Subject') ORDER BY name ASC")->fetchAll();
            }

            $unassignedCourses = array_map(function ($course) {
                return [
                    'course_id' => (int) $course['id'],
                    'code' => 'CAT-' . $course['id'],
                    'title' => $course['name'],
                    'type' => $course['type'],
                    'section' => 'Unassigned',
                    'teacher' => 'Unassigned',
                    'students' => 0,
                ];
            }, $unassignedCourseRows);

            $this->success([
                'summary' => $summary,
                'hierarchy' => $hierarchy,
                'levels' => array_values($levels),
                'unassigned_courses' => $unassignedCourses,
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getAssignmentsOverview(Request $request, Response $response) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();

            $overdueStmt = $db->query("
                SELECT COUNT(*) FROM assignments 
                WHERE due_date < NOW()
            ");
            $overdueCount = (int) $overdueStmt->fetchColumn();

            $totalSubmissionsStmt = $db->query("SELECT COUNT(*) FROM submissions");
            $totalSubmissions = (int) $totalSubmissionsStmt->fetchColumn();

            $totalAssignmentsStmt = $db->query("SELECT COUNT(*) FROM assignments");
            $totalAssignments = (int) $totalAssignmentsStmt->fetchColumn();

            $submissionRate = $totalAssignments > 0 
                ? round(($totalSubmissions / ($totalAssignments * 42)) * 100, 0) 
                : 0;

            $gradedSubmissionsStmt = $db->query("SELECT COUNT(*) FROM submissions WHERE status = 'graded'");
            $gradedSubmissions = (int) $gradedSubmissionsStmt->fetchColumn();

            $gradingCompletion = $totalSubmissions > 0 
                ? round(($gradedSubmissions / $totalSubmissions) * 100, 0) 
                : 0;

            $teacherActivityStmt = $db->query("
                SELECT 
                    COUNT(DISTINCT u.id) as active_teachers,
                    COUNT(DISTINCT a.id) as assignments_created_today
                FROM users u
                INNER JOIN roles r ON r.id = u.role_id
                LEFT JOIN assignments a ON a.created_by = u.id AND DATE(a.created_at) = CURDATE()
                WHERE r.role_name = 'TEACHER'
            ");
            $teacherStats = $teacherActivityStmt->fetch();
            $teacherActivity = $teacherStats['assignments_created_today'] > 3 ? 'High' : ($teacherStats['assignments_created_today'] > 0 ? 'Medium' : 'Low');

            $recentAssignmentsStmt = $db->query("
                SELECT
                    a.id,
                    a.title,
                    c.name as course,
                    u.full_name as teacher,
                    a.due_date,
                    (
                        SELECT COUNT(*) FROM submissions s 
                        WHERE s.assignment_id = a.id 
                        AND s.status IN ('pending', 'graded', 'late')
                    ) as submitted_count,
                    (
                        SELECT COUNT(DISTINCT student_id) FROM submissions s 
                        WHERE s.assignment_id = a.id
                    ) as unique_students,
                    CASE 
                        WHEN a.due_date < NOW() AND (
                            SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id AND status != 'graded'
                        ) > 0 THEN 'Overdue'
                        WHEN (
                            SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id AND status = 'graded'
                        ) = (
                            SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id
                        ) THEN 'Completed'
                        WHEN (
                            SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id AND status IN ('pending', 'late')
                        ) > 0 THEN 'In Progress'
                        ELSE 'Awaiting Grade'
                    END as status,
                    (
                        SELECT COUNT(*) FROM submissions s 
                        WHERE s.assignment_id = a.id 
                    ) as total_submissions
                FROM assignments a
                INNER JOIN categories c ON c.id = a.course_id
                INNER JOIN users u ON u.id = a.created_by
                ORDER BY a.due_date DESC
                LIMIT 8
            ");
            $assignments = $recentAssignmentsStmt->fetchAll();

            $formattedAssignments = array_map(function ($a) {
                return [
                    'id' => (int) $a['id'],
                    'title' => $a['title'],
                    'course' => $a['course'],
                    'teacher' => $a['teacher'],
                    'status' => $a['status'],
                    'submitted' => (int) $a['unique_students'] . '/' . (int) $a['unique_students'],
                    'submission_count' => (int) $a['submitted_count'],
                    'total_possible' => (int) $a['unique_students'],
                    'due_date' => $a['due_date'],
                ];
            }, $assignments);

            $teacherUploadsStmt = $db->query("
                SELECT COUNT(*) FROM materials 
                WHERE DATE(created_at) = CURDATE()
            ");
            $teacherUploads = (int) $teacherUploadsStmt->fetchColumn();

            $awaitingGradingStmt = $db->query("
                SELECT COUNT(DISTINCT a.course_id) FROM assignments a
                WHERE EXISTS (
                    SELECT 1 FROM submissions s 
                    WHERE s.assignment_id = a.id 
                    AND s.status IN ('pending', 'late')
                )
            ");
            $classesAwaitingGrading = (int) $awaitingGradingStmt->fetchColumn();

            $exceededDueDateStmt = $db->query("
                SELECT COUNT(DISTINCT a.id) FROM assignments a
                WHERE a.due_date < NOW()
                AND WEEK(a.due_date) = WEEK(NOW())
                AND YEAR(a.due_date) = YEAR(NOW())
            ");
            $exceededThisWeek = (int) $exceededDueDateStmt->fetchColumn();

            $this->success([
                'metrics' => [
                    'overdue_assignments' => $overdueCount,
                    'submission_rate' => $submissionRate,
                    'grading_completion' => $gradingCompletion,
                    'teacher_activity' => $teacherActivity,
                ],
                'assignments' => $formattedAssignments,
                'teacher_activity_summary' => [
                    $teacherUploads . ' teacher' . ($teacherUploads !== 1 ? 's' : '') . ' uploaded new material' . ($teacherUploads !== 1 ? 's' : '') . ' today',
                    $classesAwaitingGrading . ' class' . ($classesAwaitingGrading !== 1 ? 'es' : '') . ' currently awaiting grading',
                    $exceededThisWeek . ' assignment' . ($exceededThisWeek !== 1 ? 's' : '') . ' exceeded due date this week',
                ],
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getDiscussionsMonitoring(Request $request, Response $response) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();

            // Closed/archived discussions count
            $flaggedStmt = $db->query("
                SELECT COUNT(*) FROM discussion_topics 
                WHERE status = 'closed'
            ");
            $flaggedCount = (int) $flaggedStmt->fetchColumn();

            // Total open threads
            $openThreadsStmt = $db->query("
                SELECT COUNT(*) FROM discussion_topics 
                WHERE status = 'open'
            ");
            $openThreads = (int) $openThreadsStmt->fetchColumn();

            // Total discussion groups
            $totalGroupsStmt = $db->query("
                SELECT COUNT(*) FROM discussion_groups
            ");
            $totalGroups = (int) $totalGroupsStmt->fetchColumn();

            // Engagement level based on recent message activity
            $engagementStmt = $db->query("
                SELECT COUNT(*) as message_count FROM discussion_messages 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                AND deleted_at IS NULL
            ");
            $engagementData = $engagementStmt->fetch();
            $engagementLevel = ($engagementData['message_count'] ?? 0) > 50 ? 'High' : (($engagementData['message_count'] ?? 0) > 20 ? 'Medium' : 'Low');

            // Recent discussion topics with message counts
            $threadsStmt = $db->query("
                SELECT
                    dt.id,
                    dt.title,
                    dg.title as group_title,
                    u.full_name as author,
                    dt.status,
                    COUNT(DISTINCT dm.id) as message_count,
                    MAX(dt.created_at) as created_at
                FROM discussion_topics dt
                INNER JOIN discussion_groups dg ON dg.id = dt.group_id
                INNER JOIN users u ON u.id = dt.created_by
                LEFT JOIN discussion_messages dm ON dm.topic_id = dt.id AND dm.deleted_at IS NULL
                GROUP BY dt.id, dt.title, dg.title, u.full_name, dt.status
                ORDER BY MAX(dt.created_at) DESC
                LIMIT 8
            ");
            $threads = $threadsStmt->fetchAll();

            $formattedThreads = array_map(function ($t) {
                return [
                    'id' => (int) $t['id'],
                    'title' => $t['title'] ?? 'Unnamed Discussion',
                    'author' => $t['author'] ?? 'Unknown',
                    'status' => $t['status'] === 'closed' ? 'Flagged' : ($t['status'] === 'open' ? 'Clean' : 'Moderate'),
                    'replies' => (int) $t['message_count'],
                    'last_activity' => $t['created_at'],
                ];
            }, $threads);

            $this->success([
                'metrics' => [
                    'flagged_posts' => $flaggedCount,
                    'open_threads' => $openThreads,
                    'moderation_queue' => $totalGroups,
                    'engagement' => $engagementLevel,
                ],
                'threads' => $formattedThreads,
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getAttendanceReports(Request $request, Response $response) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();

            // Overall school attendance rate (present / total)
            $overallStmt = $db->query("
                SELECT 
                    COUNT(*) as total_records,
                    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
                    SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count
                FROM attendance_records
                WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            ");
            $overallData = $overallStmt->fetch();
            $totalRecords = (int) ($overallData['total_records'] ?? 0);
            $presentCount = (int) ($overallData['present_count'] ?? 0);
            $lateCount = (int) ($overallData['late_count'] ?? 0);
            $schoolAttendanceRate = $totalRecords > 0 ? round(($presentCount / $totalRecords) * 100) : 0;

            // Monthly attendance trend (last 6 months)
            $monthlyStmt = $db->query("
                SELECT
                    DATE_FORMAT(attendance_date, '%b') as month,
                    ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100) as rate
                FROM attendance_records
                WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(attendance_date, '%Y-%m')
                ORDER BY attendance_date ASC
            ");
            $monthlyData = $monthlyStmt->fetchAll();

            // Grade-based attendance rates
            $gradeStmt = $db->query("
                SELECT
                    c.name as grade,
                    ROUND((SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) / COUNT(ar.id)) * 100) as rate
                FROM attendance_records ar
                INNER JOIN users u ON u.id = ar.student_id
                INNER JOIN categories c ON c.id = u.class_id
                WHERE ar.attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                AND c.type = 'Grade'
                GROUP BY c.id, c.name
                ORDER BY c.name ASC
            ");
            $gradeData = $gradeStmt->fetchAll();

            // Subject-based attendance rates
            $subjectStmt = $db->query("
                SELECT
                    c.name as subject,
                    ROUND((SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) / COUNT(ar.id)) * 100) as rate
                FROM attendance_records ar
                INNER JOIN categories c ON c.id = ar.course_id
                WHERE ar.attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                AND c.type IN ('Subject', 'Course')
                GROUP BY c.id, c.name
                ORDER BY c.name ASC
                LIMIT 6
            ");
            $subjectData = $subjectStmt->fetchAll();

            // Count improving grades (grades with upward trend in last 2 weeks vs previous 2 weeks)
            $improvingStmt = $db->query("
                SELECT COUNT(DISTINCT c.id) as improving_count
                FROM (
                    SELECT 
                        u.class_id,
                        ROUND((SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) / COUNT(ar.id)) * 100) as rate
                    FROM attendance_records ar
                    INNER JOIN users u ON u.id = ar.student_id
                    WHERE ar.attendance_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
                    GROUP BY u.class_id
                ) recent
                INNER JOIN (
                    SELECT 
                        u.class_id,
                        ROUND((SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) / COUNT(ar.id)) * 100) as rate
                    FROM attendance_records ar
                    INNER JOIN users u ON u.id = ar.student_id
                    WHERE ar.attendance_date >= DATE_SUB(CURDATE(), INTERVAL 28 DAY)
                    AND ar.attendance_date < DATE_SUB(CURDATE(), INTERVAL 14 DAY)
                    GROUP BY u.class_id
                ) previous ON recent.class_id = previous.class_id
                INNER JOIN categories c ON c.id = recent.class_id
                WHERE recent.rate > previous.rate
            ");
            $improvingData = $improvingStmt->fetch();
            $improvingGradesCount = (int) ($improvingData['improving_count'] ?? 0);

            $this->success([
                'metrics' => [
                    'school_attendance' => $schoolAttendanceRate,
                    'late_arrivals' => $lateCount,
                    'improving_grades' => $improvingGradesCount,
                ],
                'monthly_trend' => array_map(function ($data) {
                    return [
                        'month' => $data['month'],
                        'rate' => (int) ($data['rate'] ?? 0),
                    ];
                }, $monthlyData),
                'grade_attendance' => array_map(function ($data) {
                    return [
                        'grade' => $data['grade'],
                        'rate' => (int) ($data['rate'] ?? 0),
                    ];
                }, $gradeData),
                'subject_attendance' => array_map(function ($data) {
                    return [
                        'subject' => $data['subject'],
                        'rate' => (int) ($data['rate'] ?? 0),
                    ];
                }, $subjectData),
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function getPerformanceAnalytics(Request $request, Response $response) {
        $this->requireRole('ADMIN');

        try {
            $db = \App\Core\Database::getInstance();

            $currentStudentsStmt = $db->query("SELECT COUNT(*) FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE r.role_name = 'STUDENT'");
            $currentStudents = (int) $currentStudentsStmt->fetchColumn();

            $previousStudentsStmt = $db->query("SELECT COUNT(*) FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE r.role_name = 'STUDENT' AND u.created_at < DATE_SUB(CURDATE(), INTERVAL 30 DAY)");
            $previousStudents = (int) $previousStudentsStmt->fetchColumn();

            $studentGrowth = $previousStudents > 0
                ? round((($currentStudents - $previousStudents) / $previousStudents) * 100, 1)
                : 0.0;

            $attendanceTrendStmt = $db->query("SELECT ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 0) FROM attendance_records WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)");
            $attendanceTrend = (int) ($attendanceTrendStmt->fetchColumn() ?: 0);

            $completionStmt = $db->query("SELECT ROUND((SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 0) FROM submissions");
            $completionRate = (int) ($completionStmt->fetchColumn() ?: 0);

            $systemUsageStmt = $db->query("SELECT COUNT(*) FROM login_logs WHERE login_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
            $systemLogins = (int) $systemUsageStmt->fetchColumn();
            $systemUsageLevel = $systemLogins > 200 ? 'High' : ($systemLogins > 80 ? 'Medium' : 'Low');

            $growthStmt = $db->query("
                SELECT
                    DATE_FORMAT(month_ref, '%b') AS month,
                    SUM(students_count) AS students,
                    SUM(teachers_count) AS teachers
                FROM (
                    SELECT
                        DATE_FORMAT(u.created_at, '%Y-%m-01') AS month_ref,
                        SUM(CASE WHEN r.role_name = 'STUDENT' THEN 1 ELSE 0 END) AS students_count,
                        SUM(CASE WHEN r.role_name = 'TEACHER' THEN 1 ELSE 0 END) AS teachers_count
                    FROM users u
                    INNER JOIN roles r ON r.id = u.role_id
                    WHERE u.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                    GROUP BY DATE_FORMAT(u.created_at, '%Y-%m-01')
                ) monthly
                GROUP BY month_ref
                ORDER BY month_ref ASC
                LIMIT 6
            ");
            $growthData = $growthStmt->fetchAll();

            $attendanceWeeklyStmt = $db->query("
                SELECT
                    CONCAT('W', WEEK(attendance_date, 1)) AS week,
                    ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 0) AS rate,
                    MAX(attendance_date) AS latest_day
                FROM attendance_records
                WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 35 DAY)
                GROUP BY YEAR(attendance_date), WEEK(attendance_date, 1)
                ORDER BY latest_day ASC
                LIMIT 5
            ");
            $attendanceWeekly = $attendanceWeeklyStmt->fetchAll();

            $assignmentCompletionStmt = $db->query("
                SELECT
                    SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) AS submitted_count,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
                    SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS overdue_count
                FROM submissions
            ");
            $assignmentCompletion = $assignmentCompletionStmt->fetch();

            $teacherPostsStmt = $db->query("
                SELECT
                    COUNT(DISTINCT dt.created_by) AS active_teachers,
                    (SELECT COUNT(*) FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE r.role_name = 'TEACHER') AS total_teachers
                FROM discussion_topics dt
                INNER JOIN users u ON u.id = dt.created_by
                INNER JOIN roles r ON r.id = u.role_id
                WHERE r.role_name = 'TEACHER'
                AND dt.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ");
            $teacherPosts = $teacherPostsStmt->fetch();

            $materialsUsageStmt = $db->query("
                SELECT
                    COUNT(DISTINCT m.uploaded_by) AS active_uploaders,
                    (SELECT COUNT(*) FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE r.role_name = 'TEACHER') AS total_teachers
                FROM materials m
                WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ");
            $materialsUsage = $materialsUsageStmt->fetch();

            $quizAttemptsStmt = $db->query("
                SELECT
                    COUNT(DISTINCT s.student_id) AS students_submitted,
                    (SELECT COUNT(*) FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE r.role_name = 'STUDENT') AS total_students
                FROM submissions s
                WHERE s.submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ");
            $quizAttempts = $quizAttemptsStmt->fetch();

            $liveAttendanceStmt = $db->query("SELECT ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 0) AS live_rate FROM attendance_records WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)");
            $liveAttendance = (int) (($liveAttendanceStmt->fetch()['live_rate'] ?? 0));

            $teacherPostsPct = ((int) ($teacherPosts['total_teachers'] ?? 0)) > 0
                ? (int) round((((int) ($teacherPosts['active_teachers'] ?? 0)) / ((int) $teacherPosts['total_teachers'])) * 100)
                : 0;

            $materialsUsagePct = ((int) ($materialsUsage['total_teachers'] ?? 0)) > 0
                ? (int) round((((int) ($materialsUsage['active_uploaders'] ?? 0)) / ((int) $materialsUsage['total_teachers'])) * 100)
                : 0;

            $quizAttemptsPct = ((int) ($quizAttempts['total_students'] ?? 0)) > 0
                ? (int) round((((int) ($quizAttempts['students_submitted'] ?? 0)) / ((int) $quizAttempts['total_students'])) * 100)
                : 0;

            $this->success([
                'metrics' => [
                    'student_growth' => $studentGrowth,
                    'attendance_trend' => $attendanceTrend,
                    'completion_rate' => $completionRate,
                    'system_usage' => $systemUsageLevel,
                ],
                'growth_data' => array_map(function ($row) {
                    return [
                        'month' => $row['month'],
                        'students' => (int) ($row['students'] ?? 0),
                        'teachers' => (int) ($row['teachers'] ?? 0),
                    ];
                }, $growthData),
                'attendance_trend_data' => array_map(function ($row) {
                    return [
                        'week' => $row['week'],
                        'rate' => (int) ($row['rate'] ?? 0),
                    ];
                }, $attendanceWeekly),
                'assignment_completion' => [
                    ['name' => 'Submitted', 'value' => (int) ($assignmentCompletion['submitted_count'] ?? 0)],
                    ['name' => 'Pending', 'value' => (int) ($assignmentCompletion['pending_count'] ?? 0)],
                    ['name' => 'Overdue', 'value' => (int) ($assignmentCompletion['overdue_count'] ?? 0)],
                ],
                'engagement_data' => [
                    ['label' => 'Teacher Posts', 'value' => $teacherPostsPct],
                    ['label' => 'Material Views', 'value' => $materialsUsagePct],
                    ['label' => 'Quiz Attempts', 'value' => $quizAttemptsPct],
                    ['label' => 'Live Attendance', 'value' => $liveAttendance],
                ],
            ]);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
