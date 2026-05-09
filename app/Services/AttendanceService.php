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

    public function markAttendance(array $data) {
        // Validate required fields
        if (empty($data['student_id']) || empty($data['course_id']) || empty($data['attendance_date']) || empty($data['status'])) {
            throw new Exception("Missing required attendance fields.");
        }

        // Check for duplicates
        if ($this->attendanceRepository->checkDuplicate($data['student_id'], $data['course_id'], $data['attendance_date'])) {
            throw new Exception("Attendance already marked for this student on this date.");
        }

        // Record attendance
        $id = $this->attendanceRepository->recordAttendance($data);

        // Calculate current attendance percentage
        $percentage = $this->attendanceRepository->calculateAttendancePercentage($data['student_id'], $data['course_id']);

        // Check if absent and alert if attendance is low
        if ($data['status'] === 'absent') {
            $this->notificationService->sendNotification(
                $data['student_id'],
                "Attendance Alert",
                "You were marked absent today. Current attendance: {$percentage}%"
            );
        }

        return [
            'id' => $id,
            'current_percentage' => $percentage
        ];
    }

    public function getStudentAttendance(int $studentId, ?int $courseId = null): array {
        return $this->attendanceRepository->getStudentAttendance($studentId, $courseId);
    }

    public function getCourseAttendance(int $courseId, string $date): array {
        return $this->attendanceRepository->getCourseAttendance($courseId, $date);
    }
}
