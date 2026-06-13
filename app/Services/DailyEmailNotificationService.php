<?php

namespace App\Services;

use App\Core\Database;
use Exception;
use PDO;

class DailyEmailNotificationService {
    private PDO $db;
    private MailService $mailService;
    private NotificationService $notificationService;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->mailService = new MailService();
        $this->notificationService = new NotificationService();
    }

    public function run(): array {
        $this->ensureLogTable();

        return [
            'assignment_reminders_sent' => $this->sendAssignmentDeadlineReminders(),
            'attendance_warnings_sent' => $this->sendAttendanceWarnings(),
        ];
    }

    public function sendAssignmentDeadlineReminders(): int {
        $rows = $this->getAssignmentReminderRecipients();
        $sent = 0;

        foreach ($rows as $row) {
            $contextHash = hash('sha256', 'assignment:' . $row['assignment_id'] . ':student:' . $row['student_id']);

            if ($this->wasLogged('assignment_due_reminder', (int) $row['student_id'], 'assignment', (int) $row['assignment_id'], $contextHash)) {
                continue;
            }

            $subject = 'Assignment due in 2 days: ' . $row['assignment_title'];
            $body = "Hello {$row['student_name']},\n\n"
                . "This is a reminder that your assignment \"{$row['assignment_title']}\" for {$row['course_name']} is due on {$row['due_date']}.\n\n"
                . "Please submit it before the deadline.\n\n"
                . "The Millennium School E-Learning System";

            try {
                $this->mailService->send($row['student_email'], $subject, $body, $row['student_name']);
                $this->logEmail('assignment_due_reminder', (int) $row['student_id'], 'assignment', (int) $row['assignment_id'], $contextHash, $row['student_email'], 'sent');
                $this->notifyInApp((int) $row['student_id'], 'Assignment Deadline Reminder', "Your assignment \"{$row['assignment_title']}\" is due in 2 days.", 'assignment', (int) $row['assignment_id']);
                $sent++;
            } catch (Exception $e) {
                $this->logEmail('assignment_due_reminder', (int) $row['student_id'], 'assignment', (int) $row['assignment_id'], $contextHash, $row['student_email'], 'failed', $e->getMessage());
            }
        }

        return $sent;
    }

    public function sendAttendanceWarnings(): int {
        $rows = $this->getAttendanceWarningRecipients();
        $sent = 0;

        foreach ($rows as $row) {
            $contextHash = hash('sha256', 'attendance:' . $row['student_id'] . ':count:' . $row['absence_count'] . ':latest:' . $row['latest_absence_date']);

            if ($this->wasLogged('attendance_parent_warning', (int) $row['parent_id'], 'student', (int) $row['student_id'], $contextHash)) {
                continue;
            }

            $subject = 'Attendance warning for ' . $row['student_name'];
            $body = "Hello {$row['parent_name']},\n\n"
                . "{$row['student_name']} has been marked absent {$row['absence_count']} times in the last 30 days."
                . " The most recent absence was on {$row['latest_absence_date']}.\n\n"
                . "Please follow up with the school or the student as needed.\n\n"
                . "The Millennium School E-Learning System";

            try {
                $this->mailService->send($row['parent_email'], $subject, $body, $row['parent_name']);
                $this->logEmail('attendance_parent_warning', (int) $row['parent_id'], 'student', (int) $row['student_id'], $contextHash, $row['parent_email'], 'sent');
                $this->notifyInApp((int) $row['parent_id'], 'Attendance Warning', "{$row['student_name']} has more than 3 absences in the last 30 days.", 'student', (int) $row['student_id']);
                $sent++;
            } catch (Exception $e) {
                $this->logEmail('attendance_parent_warning', (int) $row['parent_id'], 'student', (int) $row['student_id'], $contextHash, $row['parent_email'], 'failed', $e->getMessage());
            }
        }

        return $sent;
    }

    private function getAssignmentReminderRecipients(): array {
        $stmt = $this->db->prepare("
            SELECT
                a.id AS assignment_id,
                a.title AS assignment_title,
                DATE_FORMAT(a.due_date, '%Y-%m-%d %H:%i') AS due_date,
                c.name AS course_name,
                u.id AS student_id,
                u.full_name AS student_name,
                u.email AS student_email
            FROM assignments a
            INNER JOIN categories c ON c.id = a.course_id
            INNER JOIN teacher_assignments ta ON ta.course_id = a.course_id
            INNER JOIN users u ON u.class_id = ta.class_id
            INNER JOIN roles r ON r.id = u.role_id AND r.role_name = 'STUDENT'
            LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = u.id
            WHERE DATE(a.due_date) = DATE_ADD(CURDATE(), INTERVAL 2 DAY)
              AND u.status = 'active'
              AND u.email IS NOT NULL
              AND u.email <> ''
              AND s.id IS NULL
            GROUP BY a.id, u.id
            ORDER BY a.due_date ASC, u.full_name ASC
        ");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getAttendanceWarningRecipients(): array {
        $stmt = $this->db->prepare("
            SELECT
                student.id AS student_id,
                student.full_name AS student_name,
                parent.id AS parent_id,
                parent.full_name AS parent_name,
                parent.email AS parent_email,
                COUNT(*) AS absence_count,
                MAX(ar.attendance_date) AS latest_absence_date
            FROM attendance_records ar
            INNER JOIN users student ON student.id = ar.student_id
            INNER JOIN parent_student ps ON ps.student_id = student.id
            INNER JOIN users parent ON parent.id = ps.parent_id
            INNER JOIN roles parent_role ON parent_role.id = parent.role_id AND parent_role.role_name = 'PARENT'
            WHERE ar.status = 'absent'
              AND ar.attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              AND student.status = 'active'
              AND parent.status = 'active'
              AND parent.email IS NOT NULL
              AND parent.email <> ''
            GROUP BY student.id, parent.id
            HAVING COUNT(*) > 3
            ORDER BY latest_absence_date DESC, student.full_name ASC
        ");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function ensureLogTable(): void {
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS email_notification_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                notification_type VARCHAR(100) NOT NULL,
                recipient_user_id INT NOT NULL,
                reference_type VARCHAR(50) NOT NULL,
                reference_id INT NOT NULL,
                context_hash VARCHAR(64) NOT NULL,
                recipient_email VARCHAR(255) NOT NULL,
                status ENUM('sent', 'failed') NOT NULL,
                error_message TEXT DEFAULT NULL,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_email_notification (notification_type, recipient_user_id, reference_type, reference_id, context_hash),
                INDEX idx_email_notification_lookup (notification_type, recipient_user_id, reference_type, reference_id),
                FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");
    }

    private function wasLogged(string $type, int $recipientUserId, string $referenceType, int $referenceId, string $contextHash): bool {
        $stmt = $this->db->prepare("
            SELECT 1
            FROM email_notification_logs
            WHERE notification_type = :notification_type
              AND recipient_user_id = :recipient_user_id
              AND reference_type = :reference_type
              AND reference_id = :reference_id
              AND context_hash = :context_hash
              AND status = 'sent'
            LIMIT 1
        ");
        $stmt->execute([
            'notification_type' => $type,
            'recipient_user_id' => $recipientUserId,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'context_hash' => $contextHash,
        ]);

        return (bool) $stmt->fetchColumn();
    }

    private function logEmail(string $type, int $recipientUserId, string $referenceType, int $referenceId, string $contextHash, string $recipientEmail, string $status, ?string $errorMessage = null): void {
        $stmt = $this->db->prepare("
            INSERT INTO email_notification_logs
                (notification_type, recipient_user_id, reference_type, reference_id, context_hash, recipient_email, status, error_message)
            VALUES
                (:notification_type, :recipient_user_id, :reference_type, :reference_id, :context_hash, :recipient_email, :status, :error_message)
            ON DUPLICATE KEY UPDATE
                recipient_email = VALUES(recipient_email),
                status = VALUES(status),
                error_message = VALUES(error_message),
                sent_at = CURRENT_TIMESTAMP
        ");
        $stmt->execute([
            'notification_type' => $type,
            'recipient_user_id' => $recipientUserId,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'context_hash' => $contextHash,
            'recipient_email' => $recipientEmail,
            'status' => $status,
            'error_message' => $errorMessage,
        ]);
    }

    private function notifyInApp(int $userId, string $title, string $message, string $referenceType, int $referenceId): void {
        try {
            $this->notificationService->createNotification([
                'user_id' => $userId,
                'type' => $referenceType === 'assignment' ? 'assignment' : 'attendance',
                'title' => $title,
                'message' => $message,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'priority' => 'high',
            ]);
        } catch (Exception $e) {
            error_log('Daily notification in-app alert failed: ' . $e->getMessage());
        }
    }
}
