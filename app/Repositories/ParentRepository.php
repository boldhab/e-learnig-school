<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class ParentRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getLinkedChildren(int $parentId): array {
        $stmt = $this->db->prepare("
            SELECT
                u.id,
                u.full_name,
                u.student_id,
                u.email,
                u.created_at,
                u.class_id,
                ps.relationship_type,
                c.name as class_name,
                COALESCE(parent_cat.name, 'General') as department_name,
                CONCAT(YEAR(CURDATE()), '/', YEAR(CURDATE()) + 1) as academic_year
            FROM users u
            INNER JOIN parent_student ps ON ps.student_id = u.id
            LEFT JOIN categories c ON c.id = u.class_id
            LEFT JOIN categories parent_cat ON parent_cat.id = c.parent_id
            WHERE ps.parent_id = :parent_id AND u.status = 'active'
            GROUP BY u.id, u.full_name, u.student_id, u.email, u.created_at, u.class_id, ps.relationship_type, c.name, parent_cat.name
            ORDER BY u.full_name ASC
        ");
        $stmt->execute(['parent_id' => $parentId]);
        return $stmt->fetchAll();
    }

    public function verifyParentChildLink(int $parentId, int $studentId): bool {
        $stmt = $this->db->prepare("
            SELECT 1 FROM parent_student 
            WHERE parent_id = :parent_id AND student_id = :student_id
            LIMIT 1
        ");
        $stmt->execute(['parent_id' => $parentId, 'student_id' => $studentId]);
        return (bool) $stmt->fetch();
    }

    public function getParentByEmail(string $email) {
        $stmt = $this->db->prepare("
            SELECT id FROM users 
            WHERE email = :email AND role_id = (SELECT id FROM roles WHERE role_name = 'PARENT' LIMIT 1)
            LIMIT 1
        ");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch();
    }

    public function createParentStudentLink(int $parentId, int $studentId, string $relationship): void {
        $stmt = $this->db->prepare("
            INSERT IGNORE INTO parent_student (parent_id, student_id, relationship_type) 
            VALUES (:parent_id, :student_id, :relationship)
        ");
        $stmt->execute([
            'parent_id' => $parentId,
            'student_id' => $studentId,
            'relationship' => $relationship
        ]);
    }

    public function getChildProfile(int $studentId): array {
        $stmt = $this->db->prepare("
            SELECT
                u.id,
                u.full_name,
                u.student_id,
                u.email,
                u.created_at,
                u.class_id,
                c.name AS class_name,
                COALESCE(parent_cat.name, 'General') AS department_name,
                CONCAT(YEAR(CURDATE()), '/', YEAR(CURDATE()) + 1) AS academic_year
            FROM users u
            LEFT JOIN categories c ON c.id = u.class_id
            LEFT JOIN categories parent_cat ON parent_cat.id = c.parent_id
            WHERE u.id = :student_id
            GROUP BY u.id, u.full_name, u.student_id, u.email, u.created_at, u.class_id, c.name, parent_cat.name
            LIMIT 1
        ");
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function getStudentCourses(int $studentId): array {
        $stmt = $this->db->prepare("
            SELECT
                c.id AS course_id,
                c.name AS course_name,
                cl.name AS class_name,
                COALESCE(MAX(t.full_name), 'Unassigned') AS teacher_name,
                (
                    SELECT COUNT(*)
                    FROM assignments a
                    WHERE a.course_id = c.id
                ) AS assignments_total,
                (
                    SELECT COUNT(*)
                    FROM submissions s
                    INNER JOIN assignments a ON a.id = s.assignment_id
                    WHERE s.student_id = :student_id
                      AND a.course_id = c.id
                ) AS submissions_total,
                (
                    SELECT COUNT(*)
                    FROM submissions s
                    INNER JOIN assignments a ON a.id = s.assignment_id
                    INNER JOIN grades g ON g.submission_id = s.id
                    WHERE s.student_id = :student_id
                      AND a.course_id = c.id
                ) AS graded_total,
                (
                    SELECT ROUND(AVG((g.marks / NULLIF(a.max_marks, 0)) * 100), 1)
                    FROM submissions s
                    INNER JOIN assignments a ON a.id = s.assignment_id
                    INNER JOIN grades g ON g.submission_id = s.id
                    WHERE s.student_id = :student_id
                      AND a.course_id = c.id
                ) AS average_grade,
                (
                    SELECT ROUND(
                        (SUM(CASE WHEN ar.status IN ('present', 'late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100,
                        1
                    )
                    FROM attendance_records ar
                    WHERE ar.student_id = :student_id
                      AND ar.course_id = c.id
                ) AS attendance_percentage
            FROM users u
            INNER JOIN teacher_assignments ta ON ta.class_id = u.class_id
            INNER JOIN categories c ON c.id = ta.course_id
            LEFT JOIN categories cl ON cl.id = u.class_id
            LEFT JOIN users t ON t.id = ta.teacher_id
            WHERE u.id = :student_id
            GROUP BY c.id, c.name, cl.name
            ORDER BY c.name ASC
        ");
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getStudentAssignments(int $studentId): array {
        $stmt = $this->db->prepare("
            SELECT
                a.id,
                a.title,
                a.description,
                a.due_date,
                a.max_marks,
                a.created_at,
                c.name AS course_name,
                MAX(COALESCE(t.full_name, author.full_name, 'Teacher')) AS teacher_name,
                s.id AS submission_id,
                s.status AS submission_status,
                s.submitted_at,
                g.marks,
                g.feedback,
                g.published_at,
                CASE
                    WHEN g.id IS NOT NULL OR s.status = 'graded' THEN 'graded'
                    WHEN s.id IS NOT NULL AND (
                        s.status = 'late' OR
                        (s.submitted_at IS NOT NULL AND a.due_date IS NOT NULL AND s.submitted_at > a.due_date)
                    ) THEN 'late'
                    WHEN s.id IS NOT NULL THEN 'submitted'
                    WHEN a.due_date IS NOT NULL AND a.due_date < NOW() THEN 'missing'
                    ELSE 'pending'
                END AS parent_status
            FROM users u
            INNER JOIN teacher_assignments ta ON ta.class_id = u.class_id
            INNER JOIN assignments a ON a.course_id = ta.course_id
            INNER JOIN categories c ON c.id = a.course_id
            LEFT JOIN users t ON t.id = ta.teacher_id
            LEFT JOIN users author ON author.id = a.created_by
            LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = u.id
            LEFT JOIN grades g ON g.submission_id = s.id
            WHERE u.id = :student_id
            GROUP BY
                a.id, a.title, a.description, a.due_date, a.max_marks, a.created_at,
                c.name, s.id, s.status, s.submitted_at, g.id, g.marks, g.feedback, g.published_at
            ORDER BY a.due_date DESC, a.created_at DESC
        ");
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAttendanceMonthlyBreakdown(int $studentId): array {
        $stmt = $this->db->prepare("
            SELECT
                DATE_FORMAT(attendance_date, '%Y-%m') AS month_key,
                DATE_FORMAT(attendance_date, '%b %Y') AS month_label,
                COUNT(*) AS total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_count,
                ROUND(
                    (SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100,
                    1
                ) AS attendance_percentage
            FROM attendance_records
            WHERE student_id = :student_id
            GROUP BY DATE_FORMAT(attendance_date, '%Y-%m'), DATE_FORMAT(attendance_date, '%b %Y')
            ORDER BY month_key DESC
            LIMIT 6
        ");
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAttendanceLateArrivalTrend(int $studentId): array {
        $stmt = $this->db->prepare("
            SELECT
                YEARWEEK(attendance_date, 1) AS week_key,
                MIN(attendance_date) AS week_start,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absence_count
            FROM attendance_records
            WHERE student_id = :student_id
              AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK)
            GROUP BY YEARWEEK(attendance_date, 1)
            ORDER BY week_key DESC
            LIMIT 8
        ");
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecentNotifications(int $parentId, int $limit = 10): array {
        $stmt = $this->db->prepare("
            SELECT id, type, title, message, priority, is_read, created_at
            FROM notifications
            WHERE user_id = :parent_id
            ORDER BY created_at DESC
            LIMIT :limit
        ");
        $stmt->bindValue(':parent_id', $parentId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
