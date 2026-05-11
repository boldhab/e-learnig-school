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
            if (!empty($data['course_id']) && !empty($data['class_id'])) {
                $this->adminService->assignTeacherToCourse($id, $data['course_id'], $data['class_id']);
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
        if (empty($data['teacher_id']) || empty($data['course_id']) || empty($data['class_id'])) {
            $this->error('Teacher ID, Course ID, and Class ID are required', 422);
        }
        try {
            $this->adminService->assignTeacherToCourse($data['teacher_id'], $data['course_id'], $data['class_id']);
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

    public function getClasses(Request $request, Response $response) {
        $this->requireRole('ADMIN');
        try {
            $db = \App\Core\Database::getInstance();
            $classes = $db->query("SELECT id, name FROM categories WHERE type = 'Grade'")->fetchAll();
            $this->success($classes);
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
}
