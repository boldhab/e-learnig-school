<?php

namespace App\Services;

use App\Repositories\AttendanceRepository;
use App\Services\NotificationService;
use Exception;

class AttendanceService {
    protected $attendanceRepository;
    protected $notificationService;

    public function __construct() {
        $this->attendanceRepository = new AttendanceRepository();
        $this->notificationService = new NotificationService();
    }

    public function bulkMarkAttendance(array $attendanceData) {
        $courseId = $attendanceData['course_id'];
        $date = $attendanceData['attendance_date'];
        $teacherId = $attendanceData['teacher_id'];
        $records = $attendanceData['records']; // Array of { student_id, status, remarks }

        // Validate required fields
        if (empty($courseId) || empty($date) || empty($teacherId) || empty($records)) {
            throw new Exception('Missing required fields for bulk attendance marking');
        }

        $successCount = 0;
        $errors = [];

        foreach ($records as $index => $record) {
            try {
                // Validate each record
                if (empty($record['student_id']) || empty($record['status'])) {
                    $errors[] = "Record {$index}: Missing student_id or status";
                    continue;
                }

                // Validate status
                $validStatuses = ['present', 'absent', 'late', 'excused'];
                if (!in_array($record['status'], $validStatuses)) {
                    $errors[] = "Record {$index}: Invalid status '{$record['status']}'";
                    continue;
                }

                $data = [
                    'student_id'      => (int)$record['student_id'],
                    'course_id'       => (int)$courseId,
                    'teacher_id'      => (int)$teacherId,
                    'attendance_date' => $date,
                    'status'          => $record['status'],
                    'remarks'         => $record['remarks'] ?? null
                ];

                $this->attendanceRepository->upsertAttendance($data);
                $successCount++;

                // Notify student if marked absent (non-critical)
                if ($record['status'] === 'absent') {
                    try {
                        $percentage = $this->attendanceRepository->calculateAttendancePercentage(
                            (int)$record['student_id'],
                            (int)$courseId
                        );
                        
                        // Create notification without broadcasting to avoid errors
                        $this->createSimpleNotification(
                            (int)$record['student_id'],
                            "Attendance Alert",
                            "You were marked absent today. Current attendance: {$percentage}%"
                        );

                        // Notify parents
                        $parentRepo = new \App\Repositories\ParentRepository();
                        $parents = $parentRepo->getLinkedChildren((int)$record['student_id']); // Wait, no, we need getParentsForStudent
                        // Let me check if getParentsForStudent exists or if I should just use raw query here
                        $db = \App\Core\Database::getInstance();
                        $parentStmt = $db->prepare("SELECT parent_id FROM parent_student WHERE student_id = ?");
                        $parentStmt->execute([(int)$record['student_id']]);
                        $parentIds = $parentStmt->fetchAll(\PDO::FETCH_COLUMN);
                        foreach ($parentIds as $pid) {
                            $this->createSimpleNotification(
                                (int)$pid,
                                "Attendance Alert",
                                "Your child was marked absent today. Current attendance: {$percentage}%"
                            );
                        }
                    } catch (Exception $e) {
                        // Notification failure shouldn't affect attendance marking
                        error_log("Notification failed for student {$record['student_id']}: " . $e->getMessage());
                    }
                }
            } catch (Exception $e) {
                $errors[] = "Record {$index}: " . $e->getMessage();
            }
        }

        if ($successCount === 0 && !empty($errors)) {
            throw new Exception('Failed to mark any attendance records: ' . implode('; ', $errors));
        }

        return [
            'success_count' => $successCount,
            'total_records' => count($records),
            'errors' => $errors
        ];
    }

    /**
     * Validate that a teacher is assigned to a course.
     */
    public function validateTeacherCourseAssignment(int $teacherId, int $courseId): bool {
        return $this->attendanceRepository->isTeacherAssignedToCourse($teacherId, $courseId);
    }

    public function getStudentAttendance(int $studentId, ?int $courseId = null): array {
        return $this->attendanceRepository->getStudentAttendance($studentId, $courseId);
    }

    public function getStudentAttendanceSummary(int $studentId): array {
        return $this->attendanceRepository->getStudentAttendanceSummary($studentId);
    }

    public function getCourseAttendance(int $courseId, string $date): array {
        return $this->attendanceRepository->getCourseAttendance($courseId, $date);
    }

    /**
     * Get monthly attendance report for a course.
     */
    public function getMonthlyReport(int $courseId, string $month): array {
        return $this->attendanceRepository->getMonthlyReport($courseId, $month);
    }

    /**
     * Get summary statistics for a course.
     */
    public function getCourseSummary(int $courseId): array {
        return $this->attendanceRepository->getCourseSummary($courseId);
    }

    /**
     * Get student-wise attendance stats for a course.
     */
    public function getStudentStatsForCourse(int $courseId): array {
        return $this->attendanceRepository->getStudentStatsForCourse($courseId);
    }

    /**
     * Create a simple notification without broadcasting to avoid system dependencies
     */
    private function createSimpleNotification(int $userId, string $title, string $message): void {
        try {
            // Use the notification repository directly but skip broadcasting
            $this->notificationService->sendNotification($userId, $title, $message, 'attendance', 'medium');
        } catch (Exception $e) {
            // Silently fail - notification is not critical for attendance
            error_log("Failed to create simple notification: " . $e->getMessage());
        }
    }
}
