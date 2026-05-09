<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class DiscussionGroupRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($courseId, $title) {
        $sql = "INSERT INTO discussion_groups (course_id, title) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE title = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$courseId, $title, $title]);
        return $this->db->lastInsertId();
    }

    public function findByCourseId($courseId) {
        $sql = "SELECT * FROM discussion_groups WHERE course_id = :course_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $sql = "SELECT * FROM discussion_groups WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function getGroupsByStudent($classId) {
        $sql = "SELECT dg.* FROM discussion_groups dg
                JOIN teacher_assignments ta ON dg.course_id = ta.course_id
                WHERE ta.class_id = :class_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['class_id' => $classId]);
        return $stmt->fetchAll();
    }

    public function getGroupsByTeacher($teacherId) {
        $sql = "SELECT dg.* FROM discussion_groups dg
                JOIN teacher_assignments ta ON dg.course_id = ta.course_id
                WHERE ta.teacher_id = :teacher_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['teacher_id' => $teacherId]);
        return $stmt->fetchAll();
    }
}
