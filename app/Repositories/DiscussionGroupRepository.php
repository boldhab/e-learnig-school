<?php

namespace App\Repositories;

use App\Core\Database;

class DiscussionGroupRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->ensureSchema();
    }

    protected function ensureSchema() {
        $columnsStmt = $this->db->query("SHOW COLUMNS FROM discussion_groups LIKE 'class_id'");
        $hasClassId = (bool) $columnsStmt->fetch();

        if (!$hasClassId) {
            $this->db->exec("ALTER TABLE discussion_groups ADD COLUMN class_id INT NULL AFTER course_id");
            $this->db->exec("ALTER TABLE discussion_groups ADD CONSTRAINT fk_discussion_groups_class FOREIGN KEY (class_id) REFERENCES categories(id) ON DELETE CASCADE");
        }

        $compositeIndexStmt = $this->db->query("SHOW INDEX FROM discussion_groups WHERE Key_name = 'unique_course_class'");
        if (!$compositeIndexStmt->fetch()) {
            $this->db->exec("ALTER TABLE discussion_groups ADD UNIQUE KEY unique_course_class (course_id, class_id)");
        }
    }

    public function create($courseId, $classId, $title) {
        $sql = "INSERT INTO discussion_groups (course_id, class_id, title) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE title = VALUES(title)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$courseId, $classId, $title]);
        return $this->db->lastInsertId();
    }

    public function findByCourseId($courseId) {
        $sql = "SELECT * FROM discussion_groups WHERE course_id = :course_id ORDER BY class_id IS NULL DESC, created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetch();
    }

    public function findByCourseAndClass($courseId, $classId) {
        $sql = "SELECT * FROM discussion_groups WHERE course_id = :course_id AND class_id = :class_id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'course_id' => $courseId,
            'class_id' => $classId,
        ]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $sql = "SELECT * FROM discussion_groups WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function getAllGroups() {
        $sql = "SELECT dg.*, c.name AS course_name, cl.name AS class_name
                FROM discussion_groups dg
                LEFT JOIN categories c ON c.id = dg.course_id
                LEFT JOIN categories cl ON cl.id = dg.class_id
                ORDER BY dg.created_at DESC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function getGroupsByStudent($classId) {
        $visibleClassIds = [$classId];

        $parentStmt = $this->db->prepare("SELECT parent_id FROM categories WHERE id = ? LIMIT 1");
        $parentStmt->execute([$classId]);
        $parentId = $parentStmt->fetchColumn();
        if (!empty($parentId)) {
            $visibleClassIds[] = (int) $parentId;
        }

        $placeholders = implode(',', array_fill(0, count($visibleClassIds), '?'));
        $sql = "SELECT DISTINCT dg.*, c.name AS course_name, cl.name AS class_name
                FROM discussion_groups dg
                LEFT JOIN categories c ON c.id = dg.course_id
                LEFT JOIN categories cl ON cl.id = dg.class_id
                WHERE (dg.class_id IN ($placeholders) OR dg.class_id IS NULL)
                ORDER BY dg.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($visibleClassIds);
        return $stmt->fetchAll();
    }

    public function getGroupsByTeacher($teacherId) {
        $sql = "SELECT DISTINCT dg.*, c.name AS course_name, cl.name AS class_name
                FROM discussion_groups dg
                JOIN teacher_assignments ta ON dg.course_id = ta.course_id
                LEFT JOIN categories c ON c.id = dg.course_id
                LEFT JOIN categories cl ON cl.id = dg.class_id
                WHERE ta.teacher_id = :teacher_id
                  AND (dg.class_id = ta.class_id OR dg.class_id IS NULL)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['teacher_id' => $teacherId]);
        return $stmt->fetchAll();
    }
}
