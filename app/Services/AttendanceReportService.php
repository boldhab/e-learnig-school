<?php

namespace App\Services;

use App\Core\Database;
use Exception;
use PDO;

class AttendanceReportService {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Generate comprehensive attendance analytics for a course.
     */
    public function generateCourseAnalytics(int $courseId, ?string $startDate = null, ?string $endDate = null): array {
        if (!$startDate) $startDate = date('Y-m-01', strtotime('-3 months'));
        if (!$endDate) $endDate = date('Y-m-d');

        // Overall stats
        $overallStmt = $this->db->prepare("
            SELECT
                COUNT(DISTINCT a.student_id) as total_students,
                COUNT(DISTINCT a.attendance_date) as class_days,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as total_present,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as total_absent,
                SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as total_late,
                SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as total_excused,
                ROUND(
                    (SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 2
                ) as avg_attendance_rate
            FROM attendance_records a
            WHERE a.course_id = :course_id
                AND a.attendance_date BETWEEN :start_date AND :end_date
        ");
        $overallStmt->execute([
            'course_id' => $courseId,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
        $overall = $overallStmt->fetch(PDO::FETCH_ASSOC);

        // Weekly trends
        $weeklyStmt = $this->db->prepare("
            SELECT
                DATE_FORMAT(a.attendance_date, '%Y-W%w') as week_key,
                WEEK(a.attendance_date) as week_num,
                YEAR(a.attendance_date) as year_num,
                COUNT(DISTINCT a.student_id) as students_marked,
                ROUND(
                    (SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 1
                ) as week_rate
            FROM attendance_records a
            WHERE a.course_id = :course_id
                AND a.attendance_date BETWEEN :start_date AND :end_date
            GROUP BY YEAR(a.attendance_date), WEEK(a.attendance_date)
            ORDER BY a.attendance_date ASC
        ");
        $weeklyStmt->execute([
            'course_id' => $courseId,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
        $weekly = $weeklyStmt->fetchAll(PDO::FETCH_ASSOC);

        // Students with concerning attendance
        $concerningStmt = $this->db->prepare("
            SELECT
                u.id,
                u.full_name,
                u.student_code,
                COUNT(*) as total_classes,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                ROUND(
                    (SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 1
                ) as attendance_rate
            FROM attendance_records a
            JOIN users u ON a.student_id = u.id
            WHERE a.course_id = :course_id
                AND a.attendance_date BETWEEN :start_date AND :end_date
            GROUP BY u.id
            HAVING attendance_rate < 80
            ORDER BY attendance_rate ASC
            LIMIT 20
        ");
        $concerningStmt->execute([
            'course_id' => $courseId,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
        $concerning = $concerningStmt->fetchAll(PDO::FETCH_ASSOC);

        // Daily average trend (for visualization)
        $dailyAvgStmt = $this->db->prepare("
            SELECT
                DATE_FORMAT(a.attendance_date, '%Y-%m-%d') as date,
                ROUND(
                    (SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT a.student_id), 0)) * 100, 1
                ) as daily_rate
            FROM attendance_records a
            WHERE a.course_id = :course_id
                AND a.attendance_date BETWEEN :start_date AND :end_date
            GROUP BY DATE(a.attendance_date)
            ORDER BY a.attendance_date ASC
        ");
        $dailyAvgStmt->execute([
            'course_id' => $courseId,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
        $dailyAvg = $dailyAvgStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'date_range' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'overall' => $overall,
            'weekly_trends' => $weekly,
            'students_at_risk' => $concerning,
            'daily_average_trend' => $dailyAvg,
        ];
    }

    /**
     * Generate institution-wide attendance analytics.
     */
    public function generateInstitutionAnalytics(?string $startDate = null, ?string $endDate = null): array {
        if (!$startDate) $startDate = date('Y-m-01', strtotime('-6 months'));
        if (!$endDate) $endDate = date('Y-m-d');

        // Overall institution stats
        $overallStmt = $this->db->query("
            SELECT
                COUNT(DISTINCT student_id) as total_students_marked,
                COUNT(DISTINCT attendance_date) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as total_present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as total_absent,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as total_late,
                ROUND(
                    (SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 2
                ) as institution_avg_rate
            FROM attendance_records
            WHERE attendance_date BETWEEN '{$startDate}' AND '{$endDate}'
        ");
        $overall = $overallStmt->fetch(PDO::FETCH_ASSOC);

        // By course/subject
        $byCourseStmt = $this->db->query("
            SELECT
                c.id,
                c.name,
                COUNT(DISTINCT a.student_id) as students_marked,
                COUNT(DISTINCT a.attendance_date) as class_days,
                ROUND(
                    (SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 1
                ) as course_rate
            FROM attendance_records a
            JOIN categories c ON a.course_id = c.id
            WHERE a.attendance_date BETWEEN '{$startDate}' AND '{$endDate}'
            GROUP BY c.id
            ORDER BY course_rate DESC
            LIMIT 15
        ");
        $byCourse = $byCourseStmt->fetchAll(PDO::FETCH_ASSOC);

        // Trend over time (monthly)
        $monthlyTrendStmt = $this->db->query("
            SELECT
                DATE_FORMAT(attendance_date, '%Y-%m') as month,
                COUNT(DISTINCT student_id) as students_marked,
                ROUND(
                    (SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 1
                ) as monthly_rate
            FROM attendance_records
            WHERE attendance_date BETWEEN '{$startDate}' AND '{$endDate}'
            GROUP BY DATE_FORMAT(attendance_date, '%Y-%m')
            ORDER BY attendance_date ASC
        ");
        $monthlyTrend = $monthlyTrendStmt->fetchAll(PDO::FETCH_ASSOC);

        // Distribution by status
        $distributionStmt = $this->db->query("
            SELECT
                status,
                COUNT(*) as count,
                ROUND((COUNT(*) / (SELECT COUNT(*) FROM attendance_records WHERE attendance_date BETWEEN '{$startDate}' AND '{$endDate}')) * 100, 1) as percentage
            FROM attendance_records
            WHERE attendance_date BETWEEN '{$startDate}' AND '{$endDate}'
            GROUP BY status
        ");
        $distribution = $distributionStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'date_range' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'overall' => $overall,
            'by_course' => $byCourse,
            'monthly_trend' => $monthlyTrend,
            'status_distribution' => $distribution,
        ];
    }

    /**
     * Get attendance insights and recommendations.
     */
    public function generateInsights(int $courseId, ?string $startDate = null, ?string $endDate = null): array {
        if (!$startDate) $startDate = date('Y-m-01', strtotime('-1 month'));
        if (!$endDate) $endDate = date('Y-m-d');

        $insights = [
            'alerts' => [],
            'trends' => [],
            'recommendations' => [],
        ];

        // Check for declining trends
        $twoWeeksAgoEnd = date('Y-m-d', strtotime('-14 days'));
        $twoWeeksAgoStart = date('Y-m-d', strtotime('-28 days'));

        $recentStmt = $this->db->prepare("
            SELECT ROUND(
                (SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 1
            ) as rate
            FROM attendance_records
            WHERE course_id = :course_id AND attendance_date BETWEEN :start AND :end
        ");
        $recentStmt->execute(['course_id' => $courseId, 'start' => date('Y-m-d', strtotime('-14 days')), 'end' => $endDate]);
        $recentRate = (float)($recentStmt->fetchColumn() ?? 0);

        $previousStmt = $this->db->prepare("
            SELECT ROUND(
                (SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 1
            ) as rate
            FROM attendance_records
            WHERE course_id = :course_id AND attendance_date BETWEEN :start AND :end
        ");
        $previousStmt->execute(['course_id' => $courseId, 'start' => $twoWeeksAgoStart, 'end' => $twoWeeksAgoEnd]);
        $previousRate = (float)($previousStmt->fetchColumn() ?? 0);

        if ($recentRate < $previousRate - 5) {
            $insights['alerts'][] = "Declining attendance trend detected (Previous: {$previousRate}%, Recent: {$recentRate}%)";
            $insights['recommendations'][] = "Consider sending reminders to students about attendance importance";
        }

        // High absence rate
        if ($recentRate < 75) {
            $insights['alerts'][] = "Attendance rate below 75% - intervention recommended";
            $insights['recommendations'][] = "Schedule one-on-one conversations with frequently absent students";
        }

        // Check for sudden spikes in absence
        $yesterdayStmt = $this->db->prepare("
            SELECT COUNT(*) as absent_count
            FROM attendance_records
            WHERE course_id = :course_id AND attendance_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND status = 'absent'
        ");
        $yesterdayStmt->execute(['course_id' => $courseId]);
        $yesterdayAbsent = (int)$yesterdayStmt->fetchColumn();

        if ($yesterdayAbsent > 5) {
            $insights['alerts'][] = "Unusually high absence count yesterday ({$yesterdayAbsent} students)";
            $insights['recommendations'][] = "Investigate possible reasons (event, holiday, etc.)";
        }

        $insights['trends'][] = "Attendance trend: " . ($recentRate >= 80 ? "Healthy" : "Needs Improvement");

        return $insights;
    }

    /**
     * Prepare data for CSV export.
     */
    public function prepareCSVData(int $courseId, ?string $startDate = null, ?string $endDate = null): array {
        if (!$startDate) $startDate = date('Y-m-01', strtotime('-3 months'));
        if (!$endDate) $endDate = date('Y-m-d');

        // Get all attendance records
        $stmt = $this->db->prepare("
            SELECT
                u.full_name,
                u.student_code,
                u.email,
                a.attendance_date,
                a.status,
                a.remarks
            FROM attendance_records a
            JOIN users u ON a.student_id = u.id
            WHERE a.course_id = :course_id
                AND a.attendance_date BETWEEN :start_date AND :end_date
            ORDER BY u.full_name, a.attendance_date
        ");
        $stmt->execute([
            'course_id' => $courseId,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get student attendance history.
     */
    public function getStudentAttendanceHistory(int $studentId, int $courseId, ?string $startDate = null, ?string $endDate = null): array {
        if (!$startDate) $startDate = date('Y-m-01', strtotime('-6 months'));
        if (!$endDate) $endDate = date('Y-m-d');

        $stmt = $this->db->prepare("
            SELECT
                a.attendance_date,
                a.status,
                a.remarks,
                u.full_name as teacher_name,
                c.name as course_name
            FROM attendance_records a
            JOIN users u ON a.teacher_id = u.id
            JOIN categories c ON a.course_id = c.id
            WHERE a.student_id = :student_id
                AND a.course_id = :course_id
                AND a.attendance_date BETWEEN :start_date AND :end_date
            ORDER BY a.attendance_date DESC
        ");
        $stmt->execute([
            'student_id' => $studentId,
            'course_id' => $courseId,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
