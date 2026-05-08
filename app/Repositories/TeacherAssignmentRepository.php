<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class TeacherAssignmentRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function assign($teacherId, $courseId, $classId) {
        $sql = "INSERT INTO teacher_assignments (teacher_id, course_id, class_id) 
                VALUES (:teacher_id, :course_id, :class_id) 
                ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'teacher_id' => $teacherId,
            'course_id' => $courseId,
            'class_id' => $classId
        ]);
    }

    public function getByTeacher($teacherId) {
        $sql = "SELECT ta.*, c.name as course_name, cl.name as class_name 
                FROM teacher_assignments ta 
                JOIN categories c ON ta.course_id = c.id 
                JOIN categories cl ON ta.class_id = cl.id 
                WHERE ta.teacher_id = :teacher_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['teacher_id' => $teacherId]);
        return $stmt->fetchAll();
    }

    public function removeAssignment($id) {
        $sql = "DELETE FROM teacher_assignments WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
