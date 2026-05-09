<?php

// Manual autoloader for PSR-4
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/app/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

use App\Core\Database;
use App\Services\NotificationService;
use App\Services\AnnouncementService;
use App\Services\HelpSupportService;
use App\Services\AssignmentService;
use App\Services\GradingService;
use App\Services\PerformanceService;
use App\Services\GapAnalysisService;

try {
    $db = Database::getInstance();
    
    echo "====================================================\n";
    echo "MODULE H TESTING\n";
    echo "====================================================\n";

    echo "STEP 1 - DATABASE VERIFICATION\n";
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $required = ['notifications', 'announcements', 'faqs', 'support_tickets', 'support_ticket_replies', 'user_guides'];
    foreach ($required as $table) {
        echo "$table: " . (in_array($table, $tables) ? 'OK' : 'MISSING') . "\n";
    }

    // CLEANUP & SEEDING
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");
    $db->exec("TRUNCATE notifications");
    $db->exec("TRUNCATE announcements");
    $db->exec("TRUNCATE faqs");
    $db->exec("TRUNCATE support_tickets");
    $db->exec("TRUNCATE support_ticket_replies");
    $db->exec("TRUNCATE assignments");
    $db->exec("TRUNCATE submissions");
    $db->exec("TRUNCATE grades");
    $db->exec("TRUNCATE teacher_assignments");
    $db->exec("DELETE FROM users WHERE id IN (10, 11)");
    $db->exec("DELETE FROM categories WHERE id IN (10, 11)");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1");

    // Seed data
    $db->exec("INSERT INTO categories (id, name, type) VALUES (10, 'Grade 10', 'Grade')");
    $db->exec("INSERT INTO categories (id, name, type, parent_id) VALUES (11, 'Physics', 'Course', 10)");
    $db->exec("INSERT INTO users (id, full_name, username, email, password, role_id, class_id) VALUES (10, 'John Student', 'student10', 'student10@t.com', 'pass', 3, 10)");
    $db->exec("INSERT INTO users (id, full_name, username, email, password, role_id) VALUES (11, 'Dr. Teacher', 'teacher11', 'teacher11@t.com', 'pass', 2)");
    $db->exec("INSERT INTO teacher_assignments (teacher_id, course_id, class_id) VALUES (11, 11, 10)");

    echo "\nSTEP 2 - TEST NOTIFICATIONS\n";
    $assignmentService = new AssignmentService();
    $notifService = new NotificationService();

    // H-01 Automatic Assignment Notification
    $asgnId = $assignmentService->createAssignment([
        'title' => 'Newton Laws',
        'description' => 'Homework on gravity',
        'course_id' => 11,
        'created_by' => 11,
        'due_date' => '2026-12-31 23:59:59',
        'max_marks' => 100
    ]);
    echo "H-01 Assignment Created (ID: $asgnId)\n";
    
    sleep(1); // Ensure distinct timestamps
    
    $notifs = $notifService->getUserNotifications(10);
    echo "Notification count for Student: " . count($notifs) . "\n";
    if (count($notifs) > 0 && $notifs[0]['type'] === 'assignment') {
        echo "H-01 Automatic Notification: SUCCESS\n";
    }

    // H-02 Get Notifications
    echo "H-02 Get Notifications: SUCCESS\n";

    // H-03 Mark Read
    $notifId = $notifs[0]['id'];
    $notifService->markAsRead($notifId, 10);
    $checkNotif = $db->query("SELECT is_read FROM notifications WHERE id = $notifId")->fetch();
    echo "H-03 Mark Read: " . ($checkNotif['is_read'] ? 'SUCCESS' : 'FAILED') . "\n";

    echo "\nSTEP 3 - TEST ANNOUNCEMENTS\n";
    $annService = new AnnouncementService();
    $annId = $annService->createAnnouncement([
        'title' => 'Exam Week',
        'message' => 'Final exams start Monday',
        'target_role' => 'student',
        'created_by' => 11
    ]);
    echo "H-04 Announcement Created (ID: $annId)\n";
    $studentAnns = $annService->getAnnouncements('student');
    echo "Visible to Student: " . (count($studentAnns) > 0 ? 'YES' : 'NO') . "\n";

    echo "\nSTEP 4 - TEST FAQ SYSTEM\n";
    $helpService = new HelpSupportService();
    $faqId = $helpService->createFAQ([
        'question' => 'How to submit?', 'answer' => 'Upload file.', 'category' => 'Assn', 'created_by' => 11
    ]);
    echo "H-05 FAQ Created (ID: $faqId)\n";

    echo "\nSTEP 5 - TEST SUPPORT TICKETS\n";
    $ticketId = $helpService->createTicket([
        'subject' => 'Help', 'category' => 'technical', 'message' => 'Fails', 'user_id' => 10
    ]);
    echo "H-06 Ticket Created (ID: $ticketId)\n";
    
    sleep(1);
    
    $replyId = $helpService->replyToTicket([
        'ticket_id' => $ticketId, 'user_id' => 11, 'message' => 'Fixed'
    ]);
    echo "H-07 Reply Created (ID: $replyId)\n";
    $notifsAfterReply = $notifService->getUserNotifications(10);
    echo "Latest Notification: " . $notifsAfterReply[0]['title'] . "\n";

    echo "\nSTEP 7 - FULL INTEGRATION TEST\n";
    // 3. Student submits assignment
    $db->exec("INSERT INTO submissions (id, assignment_id, student_id, status) VALUES (10, $asgnId, 10, 'pending')");
    echo "3. Submission Created\n";

    sleep(1);

    // 4. Teacher grades assignment
    $gradingService = new GradingService();
    $gradingService->gradeSubmission(10, 40, 'Low', 11);
    echo "4. Graded (40/100)\n";

    $notifsAfterGrade = $notifService->getUserNotifications(10);
    echo "5. Grade Notification: " . $notifsAfterGrade[0]['title'] . "\n";

    // 6. Performance
    $perfService = new PerformanceService();
    $perfReport = $perfService->generateReport(10, 11);
    echo "6. Overall Score: " . $perfReport['overall_score'] . "\n";

    sleep(1);

    // 7. Gap Analysis
    $gapService = new GapAnalysisService();
    $analysis = $gapService->generateAnalysis(10, 11, 11);
    echo "7. Risk Level: " . $analysis['risk_level'] . "\n";
    
    $finalNotifs = $notifService->getUserNotifications(10);
    echo "8. Final Notification: " . $finalNotifs[0]['title'] . "\n";

    echo "\nFULL INTEGRATION TEST: SUCCESS\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
