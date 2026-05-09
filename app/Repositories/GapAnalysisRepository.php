<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class GapAnalysisRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function createAnalysis(array $data): int {
        $sql = "INSERT INTO gap_analysis (student_id, course_id, weak_topics, improvement_recommendations, risk_level, generated_by) 
                VALUES (:student_id, :course_id, :weak_topics, :improvement_recommendations, :risk_level, :generated_by)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'student_id' => $data['student_id'],
            'course_id' => $data['course_id'],
            'weak_topics' => $data['weak_topics'],
            'improvement_recommendations' => $data['improvement_recommendations'],
            'risk_level' => $data['risk_level'],
            'generated_by' => $data['generated_by']
        ]);
        
        return $this->db->lastInsertId();
    }

    public function getStudentAnalysis(int $studentId, ?int $courseId = null): array {
        $sql = "SELECT g.*, c.name as course_name 
                FROM gap_analysis g 
                JOIN categories c ON g.course_id = c.id 
                WHERE g.student_id = :student_id";
        
        $params = ['student_id' => $studentId];
        
        if ($courseId) {
            $sql .= " AND g.course_id = :course_id";
            $params['course_id'] = $courseId;
        }
        
        $sql .= " ORDER BY g.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getHighRiskStudents(): array {
        $sql = "SELECT g.*, u.full_name as student_name, u.email, c.name as course_name 
                FROM gap_analysis g 
                JOIN users u ON g.student_id = u.id 
                JOIN categories c ON g.course_id = c.id 
                WHERE g.risk_level = 'high' 
                ORDER BY g.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
