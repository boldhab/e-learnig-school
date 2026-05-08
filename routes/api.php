<?php

use App\Core\Router;
use App\Controllers\AuthController;
use App\Controllers\AdminController;
use App\Controllers\UserController;

/** @var Router $router */

// Auth Routes
$router->post('/api/login', [AuthController::class, 'login']);
$router->post('/api/logout', [AuthController::class, 'logout']);
$router->get('/api/me', [AuthController::class, 'me']);

// Admin Routes
$router->post('/api/admin/students', [AdminController::class, 'createStudent']);
$router->post('/api/admin/teachers', [AdminController::class, 'createTeacher']);
$router->get('/api/admin/users', [AdminController::class, 'getAllUsers']);
$router->put('/api/admin/users/status', [AdminController::class, 'changeUserStatus']);
$router->post('/api/admin/assign-student', [AdminController::class, 'assignStudent']);
$router->post('/api/admin/assign-teacher', [AdminController::class, 'assignTeacher']);
$router->get('/api/admin/teachers/{id}/assignments', [AdminController::class, 'getTeacherAssignments']);

// Category/Course Routes
$router->post('/api/categories', [\App\Controllers\CategoryController::class, 'create']);
$router->get('/api/categories', [\App\Controllers\CategoryController::class, 'list']);

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

// Discussion Routes
$router->get('/api/courses/{id}/discussion', [\App\Controllers\DiscussionController::class, 'getCourseDiscussion']);
$router->post('/api/discussions/{id}/topics', [\App\Controllers\DiscussionController::class, 'createTopic']);
$router->get('/api/discussions/{id}/topics', [\App\Controllers\DiscussionController::class, 'listTopics']);
$router->post('/api/topics/{id}/messages', [\App\Controllers\DiscussionController::class, 'postMessage']);
$router->get('/api/topics/{id}/messages', [\App\Controllers\DiscussionController::class, 'listMessages']);
$router->delete('/api/messages/{id}', [\App\Controllers\DiscussionController::class, 'deleteMessage']);
$router->post('/api/topics/{id}/close', [\App\Controllers\DiscussionController::class, 'closeTopic']);
$router->post('/api/topics/{id}/open', [\App\Controllers\DiscussionController::class, 'openTopic']);
$router->put('/api/admin/users/status', [AdminController::class, 'changeUserStatus']);

// Profile Routes (Protected by UserController constructor middleware)
$router->get('/api/profile', [UserController::class, 'getProfile']);
$router->put('/api/profile', [UserController::class, 'updateProfile']);
$router->post('/api/change-password', [UserController::class, 'changePassword']);

// Content Delivery Routes (Cloudinary)
$router->post('/api/materials/upload', [\App\Controllers\ContentController::class, 'upload']);
$router->get('/api/materials', [\App\Controllers\ContentController::class, 'listForStudent']);
$router->delete('/api/materials', [\App\Controllers\ContentController::class, 'delete']);
