<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class GapAnalysisRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->ensureTableExists();
    }

    /**
     * Ensure the gap_analysis table exists and has all required columns.
     * Uses information_schema checks before each ALTER TABLE so it is safe
     * to call on every request (no-op when already up-to-date).
     */
    private function ensureTableExists(): void {
        // 1) Create the table if it has never been created
        $createSql = "CREATE TABLE IF NOT EXISTS gap_analysis (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            course_id INT NOT NULL,
            weak_topics TEXT NOT NULL,
            improvement_recommendations TEXT NOT NULL,
            risk_level ENUM('low', 'medium', 'high') NOT NULL,
            generated_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id) REFERENCES categories(id) ON DELETE CASCADE,
            FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE
        )";
        try {
            $this->db->exec($createSql);
        } catch (\PDOException $e) {
            error_log('GapAnalysisRepository::ensureTableExists (create): ' . $e->getMessage());
        }

        // 2) Add columns that were introduced in later schema versions
        $this->addColumnIfMissing('attendance_percentage', 'DECIMAL(5,2) NOT NULL DEFAULT 0.00');
        $this->addColumnIfMissing('overall_score',         'DECIMAL(5,2) NOT NULL DEFAULT 0.00');
    }

    /**
     * Add a column to gap_analysis only if it does not already exist.
     */
    private function addColumnIfMissing(string $column, string $definition): void {
        try {
            $stmt = $this->db->prepare(
                "SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME   = 'gap_analysis'
                   AND COLUMN_NAME  = :col"
            );
            $stmt->execute(['col' => $column]);
            if ((int)$stmt->fetchColumn() === 0) {
                $this->db->exec("ALTER TABLE gap_analysis ADD COLUMN {$column} {$definition}");
                error_log("GapAnalysisRepository: added column '{$column}' to gap_analysis");
            }
        } catch (\PDOException $e) {
            error_log("GapAnalysisRepository::addColumnIfMissing({$column}): " . $e->getMessage());
        }
    }


    public function deleteAnalysisByStudentAndCourse(int $studentId, int $courseId): void {
        $sql = "DELETE FROM gap_analysis WHERE student_id = :student_id AND course_id = :course_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['student_id' => $studentId, 'course_id' => $courseId]);
    }

    public function createAnalysis(array $data): int {
        $this->deleteAnalysisByStudentAndCourse($data['student_id'], $data['course_id']);
        
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
