<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class AttendanceRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function upsertAttendance(array $data): bool {
        $sql = "INSERT INTO attendance_records (student_id, course_id, teacher_id, attendance_date, status, remarks) 
                VALUES (:student_id, :course_id, :teacher_id, :attendance_date, :status, :remarks)
                ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'student_id' => $data['student_id'],
            'course_id' => $data['course_id'],
            'teacher_id' => $data['teacher_id'],
            'attendance_date' => $data['attendance_date'],
            'status' => $data['status'],
            'remarks' => $data['remarks'] ?? null
        ]);
    }

    public function checkDuplicate(int $studentId, int $courseId, string $date): bool {
        $sql = "SELECT COUNT(*) FROM attendance_records WHERE student_id = :student_id AND course_id = :course_id AND attendance_date = :attendance_date";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'student_id' => $studentId,
            'course_id' => $courseId,
            'attendance_date' => $date
        ]);
        return $stmt->fetchColumn() > 0;
    }

    public function getStudentAttendance(int $studentId, ?int $courseId = null): array {
        $sql = "SELECT a.*, c.name as course_name, u.full_name as teacher_name 
                FROM attendance_records a 
                JOIN categories c ON a.course_id = c.id 
                JOIN users u ON a.teacher_id = u.id 
                WHERE a.student_id = :student_id";
        
        $params = ['student_id' => $studentId];
        
        if ($courseId) {
            $sql .= " AND a.course_id = :course_id";
            $params['course_id'] = $courseId;
        }
        
        $sql .= " ORDER BY a.attendance_date DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getCourseAttendance(int $courseId, string $date): array {
        $sql = "SELECT a.*, u.full_name as student_name 
                FROM attendance_records a 
                JOIN users u ON a.student_id = u.id 
                WHERE a.course_id = :course_id AND a.attendance_date = :attendance_date";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'course_id' => $courseId,
            'attendance_date' => $date
        ]);
        return $stmt->fetchAll();
    }

    public function calculateAttendancePercentage(int $studentId, int $courseId): float {
        $sql = "SELECT 
                    COUNT(*) as total_days,
                    SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) as attended_days
                FROM attendance_records 
                WHERE student_id = :student_id AND course_id = :course_id";
                
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'student_id' => $studentId,
            'course_id' => $courseId
        ]);
        
        $result = $stmt->fetch();
        if (!$result || $result['total_days'] == 0) return 0.0;
        
        return round(($result['attended_days'] / $result['total_days']) * 100, 2);
    }
}
