<?php

namespace App\Services;

use App\Repositories\AttendanceRepository;
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

        foreach ($records as $record) {
            $data = [
                'student_id' => $record['student_id'],
                'course_id' => $courseId,
                'teacher_id' => $teacherId,
                'attendance_date' => $date,
                'status' => $record['status'],
                'remarks' => $record['remarks'] ?? null
            ];

            $this->attendanceRepository->upsertAttendance($data);

            // Notify if absent
            if ($record['status'] === 'absent') {
                $percentage = $this->attendanceRepository->calculateAttendancePercentage($record['student_id'], $courseId);
                $this->notificationService->sendNotification(
                    $record['student_id'],
                    "Attendance Alert",
                    "You were marked absent today. Current attendance: {$percentage}%"
                );
            }
        }

        return true;
    }

    public function getStudentAttendance(int $studentId, ?int $courseId = null): array {
        return $this->attendanceRepository->getStudentAttendance($studentId, $courseId);
    }

    public function getCourseAttendance(int $courseId, string $date): array {
        return $this->attendanceRepository->getCourseAttendance($courseId, $date);
    }
}
