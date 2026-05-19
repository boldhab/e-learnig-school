<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class PerformanceRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function generateReport(array $data): int {
        $sql = "INSERT INTO performance_reports (student_id, course_id, assignment_average, quiz_average, exam_average, attendance_percentage, overall_score, performance_level) 
                VALUES (:student_id, :course_id, :assignment_average, :quiz_average, :exam_average, :attendance_percentage, :overall_score, :performance_level)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'student_id' => $data['student_id'],
            'course_id' => $data['course_id'],
            'assignment_average' => $data['assignment_average'],
            'quiz_average' => $data['quiz_average'],
            'exam_average' => $data['exam_average'],
            'attendance_percentage' => $data['attendance_percentage'],
            'overall_score' => $data['overall_score'],
            'performance_level' => $data['performance_level']
        ]);
        
        return $this->db->lastInsertId();
    }

    public function getStudentPerformance(int $studentId, ?int $courseId = null): array {
        $sql = "SELECT p.*, c.name as course_name 
                FROM performance_reports p 
                JOIN categories c ON p.course_id = c.id 
                WHERE p.student_id = :student_id";
        
        $params = ['student_id' => $studentId];
        
        if ($courseId) {
            $sql .= " AND p.course_id = :course_id";
            $params['course_id'] = $courseId;
        }
        
        $sql .= " ORDER BY p.generated_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getCoursePerformance(int $courseId): array {
        $sql = "SELECT p.*, u.full_name as student_name 
                FROM performance_reports p 
                JOIN users u ON p.student_id = u.id 
                WHERE p.course_id = :course_id 
                ORDER BY p.overall_score DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetchAll();
    }

    /**
     * Get aggregated course performance grouped by date (day).
     * Returns rows with keys: day (YYYY-MM-DD), avg_score, cnt
     */
    public function getCoursePerformanceTrend(int $courseId, int $days = 90): array {
        $sql = "SELECT DATE(generated_at) as day, AVG(overall_score) as avg_score, COUNT(*) as cnt
                FROM performance_reports
                WHERE course_id = :course_id AND generated_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
                GROUP BY day
                ORDER BY day ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':course_id', $courseId, PDO::PARAM_INT);
        $stmt->bindValue(':days', $days, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAggregateGrades(int $studentId, int $courseId): array {
        $sql = "SELECT 
                    a.title as assignment_title, 
                    a.max_marks, 
                    g.marks 
                FROM assignments a 
                JOIN submissions s ON a.id = s.assignment_id 
                JOIN grades g ON s.id = g.submission_id 
                WHERE s.student_id = :student_id AND a.course_id = :course_id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'student_id' => $studentId,
            'course_id' => $courseId
        ]);
        return $stmt->fetchAll();
    }

    /**
     * Get assignments in a course that the student has not submitted.
     */
    public function getUnsubmittedAssignments(int $studentId, int $courseId): array {
        $sql = "SELECT a.title 
                FROM assignments a
                LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = :student_id
                WHERE a.course_id = :course_id AND s.id IS NULL";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'student_id' => $studentId,
            'course_id' => $courseId
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get assignments that have been submitted but are not graded yet.
     */
    public function getUngradedSubmissions(int $studentId, int $courseId): array {
        $sql = "SELECT a.title 
                FROM submissions s
                JOIN assignments a ON a.id = s.assignment_id
                WHERE s.student_id = :student_id 
                  AND a.course_id = :course_id 
                  AND s.status = 'pending'";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'student_id' => $studentId,
            'course_id' => $courseId
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

