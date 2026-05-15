<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class SubmissionRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($data) {
        $sql = "INSERT INTO submissions (assignment_id, student_id, submission_file_url, submission_file_public_id, answer_text, status) 
                VALUES (:assignment_id, :student_id, :file_url, :public_id, :answer_text, :status)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'assignment_id' => $data['assignment_id'],
            'student_id' => $data['student_id'],
            'file_url' => $data['submission_file_url'] ?? null,
            'public_id' => $data['submission_file_public_id'] ?? null,
            'answer_text' => $data['answer_text'] ?? null,
            'status' => $data['status'] ?? 'pending'
        ]);
        return $this->db->lastInsertId();
    }

    public function getByAssignment($assignmentId) {
        $sql = "SELECT s.*, u.full_name as student_name, g.marks, g.feedback 
                FROM submissions s 
                JOIN users u ON s.student_id = u.id 
                LEFT JOIN grades g ON s.id = g.submission_id 
                WHERE s.assignment_id = :assignment_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['assignment_id' => $assignmentId]);
        return $stmt->fetchAll();
    }

    public function getByStudent($studentId) {
        $sql = "SELECT s.*,
                       a.title,
                       a.title as assignment_title,
                       a.max_marks,
                       c.name as course_name,
                       g.marks,
                       g.feedback,
                       g.published_at
                FROM submissions s 
                JOIN assignments a ON s.assignment_id = a.id 
                LEFT JOIN categories c ON a.course_id = c.id
                LEFT JOIN grades g ON s.id = g.submission_id 
                WHERE s.student_id = :student_id
                ORDER BY COALESCE(s.submitted_at, s.created_at) DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll();
    }

    public function findById($id) {
        $sql = "SELECT s.*, a.title, a.max_marks FROM submissions s JOIN assignments a ON s.assignment_id = a.id WHERE s.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function updateStatus($id, $status) {
        $sql = "UPDATE submissions SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id, 'status' => $status]);
    }

    public function getByTeacher($teacherId) {
        $sql = "SELECT s.*, 
                       u.full_name as student_name, 
                       a.title as assignment_title, 
                       a.max_marks, 
                       g.marks, 
                       g.feedback, 
                       g.published_at 
                FROM submissions s 
                JOIN users u ON s.student_id = u.id 
                JOIN assignments a ON s.assignment_id = a.id 
                LEFT JOIN grades g ON s.id = g.submission_id 
                WHERE a.created_by = :teacher_id
                ORDER BY s.submitted_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['teacher_id' => $teacherId]);
        return $stmt->fetchAll();
    }
}
