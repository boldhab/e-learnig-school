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
        $sql = "INSERT INTO gap_analysis (student_id, course_id, weak_topics, improvement_recommendations, risk_level, attendance_percentage, overall_score, generated_by) 
            VALUES (:student_id, :course_id, :weak_topics, :improvement_recommendations, :risk_level, :attendance_percentage, :overall_score, :generated_by)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'student_id' => $data['student_id'],
            'course_id' => $data['course_id'],
            'weak_topics' => $data['weak_topics'],
            'improvement_recommendations' => $data['improvement_recommendations'],
            'risk_level' => $data['risk_level'],
            'attendance_percentage' => $data['attendance_percentage'] ?? 0,
            'overall_score' => $data['overall_score'] ?? 0,
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
        $sql = "SELECT 
                    g.id AS id,
                    g.student_id,
                    g.course_id,
                    g.weak_topics,
                    g.improvement_recommendations,
                    g.risk_level,
                    g.attendance_percentage,
                    g.overall_score,
                    g.created_at,
                    u.full_name AS student_name,
                    u.email,
                    c.name AS course_name
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
