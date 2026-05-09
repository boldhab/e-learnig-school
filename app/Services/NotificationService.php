<?php

namespace App\Services;

use App\Repositories\NotificationRepository;
use Exception;

class NotificationService {
    protected $notificationRepo;

    public function __construct() {
        $this->notificationRepo = new NotificationRepository();
    }

    public function createNotification(array $data): int {
        $id = $this->notificationRepo->create($data);
        $data['id'] = $id;
        
        // Broadcast in real-time
        $broadcastManager = new \App\Broadcasting\BroadcastManager();
        $broadcastManager->broadcast(new \App\Events\NotificationEvent($data['user_id'], $data));
        
        return $id;
    }

    public function getUserNotifications(int $userId, int $limit = 50, int $offset = 0): array {
        return $this->notificationRepo->getUserNotifications($userId, $limit, $offset);
    }

    public function getUnreadCount(int $userId): int {
        return $this->notificationRepo->getUnreadCount($userId);
    }

    public function markAsRead(int $id, int $userId): bool {
        return $this->notificationRepo->markAsRead($id, $userId);
    }

    public function markAllAsRead(int $userId): bool {
        return $this->notificationRepo->markAllAsRead($userId);
    }

    // --- Automated Notifications Helpers ---

    // Generic helper for legacy calls from Module F
    public function sendNotification(int $userId, string $title, string $message, string $type = 'system', string $priority = 'medium'): bool {
        $this->createNotification([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'priority' => $priority
        ]);
        return true;
    }

    public function notifyAssignmentCreated(int $userId, int $assignmentId, string $title) {
        $this->createNotification([
            'user_id' => $userId,
            'type' => 'assignment',
            'title' => 'New Assignment',
            'message' => "A new assignment '$title' has been posted.",
            'reference_type' => 'assignment',
            'reference_id' => $assignmentId,
            'priority' => 'high'
        ]);
    }

    public function notifyGradePublished(int $userId, int $submissionId, string $courseName) {
        $this->createNotification([
            'user_id' => $userId,
            'type' => 'grade',
            'title' => 'Grade Published',
            'message' => "Your grade for $courseName has been published.",
            'reference_type' => 'submission',
            'reference_id' => $submissionId,
            'priority' => 'high'
        ]);
    }

    public function notifyLowAttendance(int $userId, float $percentage, int $courseId) {
        $this->createNotification([
            'user_id' => $userId,
            'type' => 'attendance',
            'title' => 'Attendance Warning',
            'message' => "Your attendance has dropped to $percentage%. Please ensure you attend classes.",
            'reference_type' => 'course',
            'reference_id' => $courseId,
            'priority' => 'high'
        ]);
    }
}
