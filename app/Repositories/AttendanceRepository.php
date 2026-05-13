<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class AttendanceRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Insert or update a single attendance record.
     */
    public function upsertAttendance(array $data): bool {
        $sql = "INSERT INTO attendance_records 
                    (student_id, course_id, teacher_id, attendance_date, status, remarks)
                VALUES 
                    (:student_id, :course_id, :teacher_id, :attendance_date, :status, :remarks)
                ON DUPLICATE KEY UPDATE 
                    status   = VALUES(status),
                    remarks  = VALUES(remarks),
                    teacher_id = VALUES(teacher_id)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'student_id'      => $data['student_id'],
            'course_id'       => $data['course_id'],
            'teacher_id'      => $data['teacher_id'],
            'attendance_date' => $data['attendance_date'],
            'status'          => $data['status'],
            'remarks'         => $data['remarks'] ?? null,
        ]);
    }

    /**
     * Check if a record already exists for student/course/date.
     */
    public function checkDuplicate(int $studentId, int $courseId, string $date): bool {
        $sql = "SELECT COUNT(*) FROM attendance_records 
                WHERE student_id = :student_id 
                  AND course_id  = :course_id 
                  AND attendance_date = :attendance_date";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'student_id'      => $studentId,
            'course_id'       => $courseId,
            'attendance_date' => $date,
        ]);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Get all attendance records for a student, optionally filtered by course.
     */
    public function getStudentAttendance(int $studentId, ?int $courseId = null): array {
        $sql = "SELECT 
                    a.id,
                    a.attendance_date,
                    a.status,
                    a.remarks,
                    a.course_id,
                    c.name  AS course_name,
                    u.full_name AS teacher_name
                FROM attendance_records a
                JOIN categories c ON a.course_id = c.id
                JOIN users u       ON a.teacher_id = u.id
                WHERE a.student_id = :student_id";

        $params = ['student_id' => $studentId];

        if ($courseId) {
            $sql .= " AND a.course_id = :course_id";
            $params['course_id'] = $courseId;
        }

        $sql .= " ORDER BY a.attendance_date DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get a rich summary of attendance for a student:
     *  - overall stats (total, present, absent, late, percentage)
     *  - per-course breakdown
     */
    public function getStudentAttendanceSummary(int $studentId): array {
        // Overall stats
        $overallSql = "SELECT
                COUNT(*)                                                           AS total,
                SUM(status = 'present')                                            AS present,
                SUM(status = 'absent')                                             AS absent,
                SUM(status = 'late')                                               AS late,
                ROUND(
                    SUM(status IN ('present','late')) / NULLIF(COUNT(*), 0) * 100, 1
                )                                                                  AS percentage
            FROM attendance_records
            WHERE student_id = :student_id";

        $overallStmt = $this->db->prepare($overallSql);
        $overallStmt->execute(['student_id' => $studentId]);
        $overall = $overallStmt->fetch(PDO::FETCH_ASSOC) ?? [
            'total' => 0, 'present' => 0, 'absent' => 0, 'late' => 0, 'percentage' => 0
        ];

        // Per-course stats
        $courseSql = "SELECT
                c.id   AS course_id,
                c.name AS course_name,
                COUNT(*)                                                           AS total,
                SUM(a.status = 'present')                                          AS present,
                SUM(a.status = 'absent')                                           AS absent,
                SUM(a.status = 'late')                                             AS late,
                ROUND(
                    SUM(a.status IN ('present','late')) / NULLIF(COUNT(*), 0) * 100, 1
                )                                                                  AS percentage
            FROM attendance_records a
            JOIN categories c ON a.course_id = c.id
            WHERE a.student_id = :student_id
            GROUP BY c.id, c.name
            ORDER BY c.name ASC";

        $courseStmt = $this->db->prepare($courseSql);
        $courseStmt->execute(['student_id' => $studentId]);
        $byCourse = $courseStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'overall'   => $overall,
            'by_course' => $byCourse,
        ];
    }

    /**
     * Get all attendance records for a course on a given date.
     */
    public function getCourseAttendance(int $courseId, string $date): array {
        $sql = "SELECT 
                    a.id,
                    a.student_id,
                    a.status,
                    a.remarks,
                    u.full_name AS student_name
                FROM attendance_records a
                JOIN users u ON a.student_id = u.id
                WHERE a.course_id = :course_id
                  AND a.attendance_date = :attendance_date
                ORDER BY u.full_name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'course_id'       => $courseId,
            'attendance_date' => $date,
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Calculate the attendance percentage for a student in a specific course.
     */
    public function calculateAttendancePercentage(int $studentId, int $courseId): float {
        $sql = "SELECT
                    COUNT(*)                                            AS total_days,
                    SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) AS attended_days
                FROM attendance_records
                WHERE student_id = :student_id
                  AND course_id  = :course_id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'student_id' => $studentId,
            'course_id'  => $courseId,
        ]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result || $result['total_days'] == 0) return 0.0;

        return round(($result['attended_days'] / $result['total_days']) * 100, 2);
    }

    /**
     * Get monthly report for a course (attendance statistics for each month).
     */
    public function getMonthlyReport(int $courseId, string $month): array {
        // Format: 'YYYY-MM'
        $startDate = "$month-01";
        $endDate = date('Y-m-t', strtotime($startDate));

        $sql = "SELECT
                    DATE_FORMAT(a.attendance_date, '%d') as day,
                    a.attendance_date,
                    COUNT(DISTINCT a.student_id) as total_students,
                    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                    SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
                    SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_count
                FROM attendance_records a
                WHERE a.course_id = :course_id
                  AND a.attendance_date BETWEEN :start_date AND :end_date
                GROUP BY a.attendance_date
                ORDER BY a.attendance_date ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'course_id' => $courseId,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        $dailyRecords = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get overall monthly stats
        $statsSql = "SELECT
                    COUNT(DISTINCT a.student_id) as total_students,
                    COUNT(DISTINCT a.attendance_date) as class_days,
                    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as total_present,
                    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as total_absent,
                    SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as total_late,
                    SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as total_excused,
                    ROUND(
                        (SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 1
                    ) as avg_attendance_rate
                FROM attendance_records a
                WHERE a.course_id = :course_id
                  AND a.attendance_date BETWEEN :start_date AND :end_date";

        $statsStmt = $this->db->prepare($statsSql);
        $statsStmt->execute([
            'course_id' => $courseId,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        $summary = $statsStmt->fetch(PDO::FETCH_ASSOC);

        return [
            'month' => $month,
            'daily_records' => $dailyRecords,
            'summary' => $summary,
        ];
    }

    /**
     * Get overall summary for a course.
     */
    public function getCourseSummary(int $courseId): array {
        $sql = "SELECT
                    c.id,
                    c.name,
                    COUNT(DISTINCT a.student_id) as total_students,
                    COUNT(DISTINCT a.attendance_date) as class_days,
                    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as total_present,
                    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as total_absent,
                    SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as total_late,
                    SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as total_excused,
                    ROUND(
                        (SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 1
                    ) as avg_attendance_rate
                FROM categories c
                LEFT JOIN attendance_records a ON c.id = a.course_id
                WHERE c.id = :course_id
                GROUP BY c.id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?? [];
    }

    /**
     * Get student-wise attendance stats for a course.
     */
    public function getStudentStatsForCourse(int $courseId): array {
        $sql = "SELECT
                    u.id as student_id,
                    u.full_name,
                    u.student_code,
                    COUNT(*) as total_records,
                    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                    SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
                    SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_count,
                    ROUND(
                        (SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 1
                    ) as attendance_rate
                FROM attendance_records a
                JOIN users u ON a.student_id = u.id
                WHERE a.course_id = :course_id
                GROUP BY u.id
                ORDER BY u.full_name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Check if a teacher is assigned to a course.
     */
    public function isTeacherAssignedToCourse(int $teacherId, int $courseId): bool {
        $sql = "SELECT COUNT(*) FROM teacher_assignments 
                WHERE teacher_id = :teacher_id 
                AND course_id = :course_id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'teacher_id' => $teacherId,
            'course_id' => $courseId,
        ]);
        
        return $stmt->fetchColumn() > 0;
    }
}
