<?php

// No namespace for SystemRouter

use App\Controllers\AuthController;
use App\Controllers\AdminController;
use App\Controllers\UserController;
use App\Controllers\AttendanceController;
use App\Controllers\PerformanceController;
use App\Controllers\GapAnalysisController;
use App\Controllers\NotificationController;
use App\Controllers\AnnouncementController;
use App\Controllers\HelpController;
use App\Controllers\SupportTicketController;

/** @var Router $router */

// Health Check
$router->get('/api/health', function() {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'ok', 'modules' => 'loaded']);
    exit;
});

// Auth Routes
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);
$router->get('/api/auth/me', [AuthController::class, 'me']);

// Admin Routes
$router->post('/api/admin/students', [AdminController::class, 'createStudent']);
$router->post('/api/admin/teachers', [AdminController::class, 'createTeacher']);
$router->get('/api/admin/users', [AdminController::class, 'getAllUsers']);
$router->put('/api/admin/users/status', [AdminController::class, 'changeUserStatus']);
$router->post('/api/admin/assign-student', [AdminController::class, 'assignStudent']);
$router->post('/api/admin/assign-teacher', [AdminController::class, 'assignTeacher']);
$router->get('/api/admin/teachers/{id}/assignments', [AdminController::class, 'getTeacherAssignments']);

// Admin Routes (Extended)
$router->get('/api/admin/users', [AdminController::class, 'getAllUsers']);
$router->post('/api/admin/students', [AdminController::class, 'createStudent']);
$router->post('/api/admin/teachers', [AdminController::class, 'createTeacher']);
$router->post('/api/admin/users/status', [AdminController::class, 'changeUserStatus']);
$router->post('/api/admin/assign-student', [AdminController::class, 'assignStudent']);
$router->post('/api/admin/assign-teacher', [AdminController::class, 'assignTeacher']);
$router->get('/api/admin/teachers/{id}/assignments', [AdminController::class, 'getTeacherAssignments']);
$router->get('/api/admin/stats', [AdminController::class, 'getStats']);
$router->get('/api/admin/logs', [AdminController::class, 'getLogs']);
$router->get('/api/admin/classes', [AdminController::class, 'getClasses']);
$router->get('/api/admin/courses', [AdminController::class, 'getCourses']);
$router->post('/api/admin/users/update', [AdminController::class, 'updateUser']);
$router->post('/api/admin/users/delete', [AdminController::class, 'deleteUser']);
$router->post('/api/admin/users/reset-password', [AdminController::class, 'resetPassword']);
$router->post('/api/admin/users/status', [AdminController::class, 'changeUserStatus']);

// Category/Course Routes
$router->post('/api/categories', [\App\Controllers\CategoryController::class, 'create']);
$router->get('/api/categories', [\App\Controllers\CategoryController::class, 'list']);
$router->get('/api/courses', [\App\Controllers\CourseController::class, 'list']);
$router->get('/api/courses/{id}/students', [\App\Controllers\CourseController::class, 'students']);

// Assignment Routes
$router->post('/api/assignments/create', [\App\Controllers\AssignmentController::class, 'create']);
$router->get('/api/assignments', [\App\Controllers\AssignmentController::class, 'list']);
$router->get('/api/assignments/{id}', [\App\Controllers\AssignmentController::class, 'get']);
$router->put('/api/assignments/{id}', [\App\Controllers\AssignmentController::class, 'update']);
$router->delete('/api/assignments/{id}', [\App\Controllers\AssignmentController::class, 'delete']);

// Submission Routes
$router->post('/api/assignments/{id}/submit', [\App\Controllers\SubmissionController::class, 'submit']);
$router->get('/api/assignments/{id}/submissions', [\App\Controllers\SubmissionController::class, 'getSubmissionsByAssignment']);
$router->get('/api/student/submissions', [\App\Controllers\SubmissionController::class, 'getStudentSubmissions']);

// Grading Routes
$router->post('/api/submissions/{id}/grade', [\App\Controllers\GradingController::class, 'grade']);
$router->post('/api/grades/publish', [\App\Controllers\GradingController::class, 'publish']);

// Material Routes
$router->get('/api/materials', [\App\Controllers\MaterialController::class, 'list']);
$router->post('/api/materials/upload', [\App\Controllers\MaterialController::class, 'upload']);
$router->delete('/api/materials/{id}', [\App\Controllers\MaterialController::class, 'delete']);

// Discussion Routes
$router->get('/api/discussions/groups', [\App\Controllers\DiscussionController::class, 'getGroups']);
$router->get('/api/discussions/groups/{id}/topics', [\App\Controllers\DiscussionController::class, 'listTopics']);
$router->post('/api/discussions/groups/{id}/topics', [\App\Controllers\DiscussionController::class, 'createTopic']);
$router->get('/api/discussions/topics/{id}/messages', [\App\Controllers\DiscussionController::class, 'listMessages']);
$router->post('/api/discussions/topics/{id}/messages', [\App\Controllers\DiscussionController::class, 'postMessage']);
$router->delete('/api/discussions/messages/{id}', [\App\Controllers\DiscussionController::class, 'deleteMessage']);

// Performance & Analytics Routes
$router->get('/api/performance/student/stats', [\App\Controllers\PerformanceController::class, 'getStudentDashboardStats']);
$router->get('/api/performance/student', [\App\Controllers\PerformanceController::class, 'getByStudent']);
$router->get('/api/performance/course/{id}', [\App\Controllers\PerformanceController::class, 'getCourseData']);
$router->get('/api/performance/gap-analysis', [\App\Controllers\GapAnalysisController::class, 'getStudentAnalysis']);
$router->get('/api/performance/risk-report', [\App\Controllers\GapAnalysisController::class, 'getRiskReport']);

// Attendance Routes
$router->post('/api/attendance/bulk', [\App\Controllers\AttendanceController::class, 'bulkMark']);
$router->get('/api/attendance/course', [\App\Controllers\AttendanceController::class, 'getCourseAttendance']);
$router->get('/api/attendance/student', [\App\Controllers\AttendanceController::class, 'getStudentAttendance']);
$router->post('/api/discussions/topics/{id}/close', [\App\Controllers\DiscussionController::class, 'closeTopic']);
$router->post('/api/discussions/topics/{id}/open', [\App\Controllers\DiscussionController::class, 'openTopic']);
$router->get('/api/courses/{id}/discussion', [\App\Controllers\DiscussionController::class, 'getCourseDiscussion']);

// Profile Routes (Protected by UserController constructor middleware)
$router->get('/api/profile', [UserController::class, 'getProfile']);
$router->put('/api/profile', [UserController::class, 'updateProfile']);
$router->post('/api/change-password', [UserController::class, 'changePassword']);

// Content Delivery Routes (Cloudinary)
$router->post('/api/materials/upload', [\App\Controllers\ContentController::class, 'upload']);
$router->get('/api/materials', [\App\Controllers\ContentController::class, 'listForStudent']);
$router->delete('/api/materials', [\App\Controllers\ContentController::class, 'delete']);

// Attendance Routes
$router->post('/api/attendance/mark', [AttendanceController::class, 'mark']);
$router->get('/api/attendance/student/{id}', [AttendanceController::class, 'getByStudent']);
$router->get('/api/attendance/course/{id}', [AttendanceController::class, 'getByCourse']);
$router->get('/api/attendance/report/monthly', [AttendanceController::class, 'getMonthlyReport']);

// Performance Routes
$router->post('/api/performance/generate', [PerformanceController::class, 'generate']);
$router->get('/api/performance/student/{id}', [PerformanceController::class, 'getByStudent']);
$router->get('/api/performance/course/{id}', [PerformanceController::class, 'getByCourse']);

// Gap Analysis Routes
$router->post('/api/gap-analysis/generate', [GapAnalysisController::class, 'generate']);
$router->get('/api/gap-analysis/student/{id}', [GapAnalysisController::class, 'getByStudent']);
$router->get('/api/gap-analysis/high-risk', [GapAnalysisController::class, 'getHighRisk']);

// ==========================================
// MODULE H: NOTIFICATION & HELP MODULE
// ==========================================

// Notification Routes
$router->get('/api/notifications/stream', [\App\Controllers\SseController::class, 'stream']);
$router->post('/api/broadcasting/auth', [\App\Controllers\BroadcastingController::class, 'authenticate']);
$router->get('/api/notifications', [NotificationController::class, 'getNotifications']);
$router->get('/api/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
$router->put('/api/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
$router->put('/api/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

// Announcement Routes
$router->post('/api/announcements/create', [AnnouncementController::class, 'create']);
$router->get('/api/announcements', [AnnouncementController::class, 'list']);
$router->delete('/api/announcements/{id}', [AnnouncementController::class, 'delete']);

// FAQ Routes
$router->get('/api/help/faqs', [HelpController::class, 'getFAQs']);
$router->post('/api/help/faqs/create', [HelpController::class, 'createFAQ']);
$router->put('/api/help/faqs/{id}', [HelpController::class, 'updateFAQ']);

// User Guide Routes
$router->get('/api/help/guides', [HelpController::class, 'getGuides']);
$router->post('/api/help/guides/create', [HelpController::class, 'createGuide']);

// Support Ticket Routes
$router->post('/api/support/tickets/create', [SupportTicketController::class, 'create']);
$router->get('/api/support/tickets', [SupportTicketController::class, 'list']);
$router->get('/api/support/tickets/{id}', [SupportTicketController::class, 'get']);
$router->post('/api/support/tickets/{id}/reply', [SupportTicketController::class, 'reply']);
$router->put('/api/support/tickets/{id}/status', [SupportTicketController::class, 'updateStatus']);
