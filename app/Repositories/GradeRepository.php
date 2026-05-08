<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class GradeRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function save($data) {
        $sql = "INSERT INTO grades (submission_id, marks, feedback, graded_by) 
                VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE marks = ?, feedback = ?, graded_by = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['submission_id'],
            $data['marks'],
            $data['feedback'] ?? null,
            $data['graded_by'],
            $data['marks'],
            $data['feedback'] ?? null,
            $data['graded_by']
        ]);
    }

    public function publish($submissionIds) {
        $placeholders = implode(',', array_fill(0, count($submissionIds), '?'));
        $sql = "UPDATE grades SET published_at = CURRENT_TIMESTAMP WHERE submission_id IN ($placeholders)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($submissionIds);
    }
}
