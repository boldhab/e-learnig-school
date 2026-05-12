<?php

namespace App\Repositories;

use App\Core\Database;

class CourseRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Get all courses for a student based on their class_id.
     */
    public function getCoursesByStudent($classId) {
        $sql = "SELECT c.*, u.full_name as teacher_name,
                (SELECT COUNT(*) FROM materials m WHERE m.subject_id = c.id AND m.class_id = :class_id) as materials_count
                FROM categories c
                JOIN teacher_assignments ta ON c.id = ta.course_id
                JOIN users u ON ta.teacher_id = u.id
                WHERE ta.class_id = :class_id AND c.type IN ('Course', 'Subject')";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['class_id' => $classId]);
        return $stmt->fetchAll();
    }

    /**
     * Get all courses assigned to a teacher.
     */
    public function getCoursesByTeacher($teacherId) {
                $sql = "SELECT c.id,
                                c.name,
                                c.type,
                                ta.class_id,
                                cl.name AS class_name,
                                cl.name AS grade_name,
                                (SELECT COUNT(*)
                                        FROM users u
                                        WHERE u.class_id = ta.class_id
                                            AND u.role_id = (SELECT id FROM roles WHERE role_name = 'STUDENT' LIMIT 1)
                                ) AS students_count,
                                (SELECT COUNT(*)
                                        FROM materials m
                                        WHERE m.subject_id = c.id
                                            AND m.class_id = ta.class_id
                                            AND m.uploaded_by = ta.teacher_id
                                            AND m.status = 'active'
                                ) AS materials_count,
                                (SELECT COUNT(*)
                                        FROM assignments a
                                        WHERE a.course_id = c.id
                                            AND a.created_by = ta.teacher_id
                                ) AS assignments_count,
                                (SELECT COUNT(*)
                                        FROM submissions s
                                        INNER JOIN assignments a ON a.id = s.assignment_id
                                        INNER JOIN users u ON u.id = s.student_id
                                        WHERE a.course_id = c.id
                                            AND a.created_by = ta.teacher_id
                                            AND u.class_id = ta.class_id
                                            AND s.status = 'pending'
                                ) AS pending_submissions_count
                                FROM categories c
                                JOIN teacher_assignments ta ON c.id = ta.course_id
                                JOIN categories cl ON ta.class_id = cl.id
                                WHERE ta.teacher_id = :teacher_id AND c.type IN ('Course', 'Subject')
                                ORDER BY c.name ASC, cl.name ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['teacher_id' => $teacherId]);
        return $stmt->fetchAll();
    }

    /**
     * Get all courses (Admin only).
     */
    public function getAllCourses() {
        $sql = "SELECT * FROM categories WHERE type = 'Course'";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Get all courses (Admin only).
     */
    public function getStudentsByCourse(int $courseId): array {
        $sql = "SELECT u.id, u.full_name, u.student_id as student_code, u.class_id
                FROM users u
                JOIN teacher_assignments ta ON u.class_id = ta.class_id
                WHERE ta.course_id = :course_id
                AND u.role_id = (SELECT id FROM roles WHERE role_name = 'STUDENT')
                ORDER BY u.full_name ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetchAll();
    }
}
