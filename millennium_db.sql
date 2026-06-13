-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 08, 2026 at 04:18 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `millennium_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `target_role` enum('all','student','teacher','admin') NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `created_by`, `title`, `message`, `target_role`, `course_id`, `is_active`, `created_at`, `expires_at`) VALUES
(1, 11, 'Exam Week', 'Final exams start Monday', 'student', NULL, 1, '2026-05-09 08:21:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `course_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `due_date` datetime NOT NULL,
  `max_marks` int(11) NOT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_public_id` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `title`, `description`, `course_id`, `created_by`, `due_date`, `max_marks`, `file_url`, `file_public_id`, `file_type`, `created_at`, `updated_at`) VALUES
(1, 'Newton Laws', 'Homework on gravity', 11, 11, '2026-12-31 23:59:59', 100, NULL, NULL, NULL, '2026-05-09 08:21:14', '2026-05-09 08:21:14'),
(2, 'project managmnet', 'Do it the best', 22, 17, '2026-05-20 06:56:00', 10, 'https://res.cloudinary.com/dkncow1mu/raw/upload/v1778569013/millennium/assignments/nahjbjirs9ntjryooxtk.tmp', 'millennium/assignments/nahjbjirs9ntjryooxtk.tmp', 'application/pdf', '2026-05-12 06:56:58', '2026-05-12 06:56:58');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('present','absent','late','excused') NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`id`, `student_id`, `course_id`, `teacher_id`, `attendance_date`, `status`, `remarks`, `created_at`, `updated_at`) VALUES
(4, 14, 22, 17, '2026-05-13', 'absent', '', '2026-05-13 04:47:31', '2026-05-13 04:47:31'),
(7, 15, 22, 17, '2026-05-13', 'present', '', '2026-05-13 05:31:20', '2026-05-13 05:31:20'),
(8, 16, 22, 17, '2026-05-13', 'absent', '', '2026-05-13 05:31:20', '2026-05-13 05:31:20'),
(9, 14, 22, 17, '2026-05-15', 'absent', '', '2026-05-15 17:37:17', '2026-05-15 17:37:17'),
(10, 15, 22, 17, '2026-05-15', 'present', '', '2026-05-15 17:37:18', '2026-05-15 17:37:18'),
(11, 16, 22, 17, '2026-05-15', 'present', '', '2026-05-15 17:37:18', '2026-05-15 17:37:18'),
(12, 14, 22, 17, '2026-05-19', 'present', '', '2026-05-19 16:56:01', '2026-05-19 16:56:01'),
(13, 15, 22, 17, '2026-05-19', 'present', '', '2026-05-19 16:56:01', '2026-05-19 16:56:01'),
(14, 16, 22, 17, '2026-05-19', 'present', '', '2026-05-19 16:56:01', '2026-05-19 16:56:01');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('Grade','Subject','Course','Chapter','Topic') NOT NULL,
  `parent_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `type`, `parent_id`) VALUES
(11, 'Physics', 'Course', NULL),
(12, 'Grade 9', 'Grade', NULL),
(13, 'Grade 11', 'Grade', NULL),
(14, 'Grade 12', 'Grade', NULL),
(15, 'English', 'Subject', NULL),
(16, 'Mathmatics', 'Subject', NULL),
(21, 'Grade 10', 'Grade', NULL),
(22, 'Maths', 'Course', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `class_course_assignments`
--

CREATE TABLE `class_course_assignments` (
  `id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `course_teacher_pool`
--

CREATE TABLE `course_teacher_pool` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `course_teacher_pool`
--

INSERT INTO `course_teacher_pool` (`id`, `course_id`, `teacher_id`, `created_at`) VALUES
(1, 22, 17, '2026-05-12 03:08:04');

-- --------------------------------------------------------

--
-- Table structure for table `department_teacher_assignments`
--

CREATE TABLE `department_teacher_assignments` (
  `id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `department_teacher_assignments`
--

INSERT INTO `department_teacher_assignments` (`id`, `department_id`, `teacher_id`, `created_at`) VALUES
(1, 16, 17, '2026-05-11 18:24:25'),
(2, 16, 6, '2026-05-11 18:24:32');

-- --------------------------------------------------------

--
-- Table structure for table `discussion_groups`
--

CREATE TABLE `discussion_groups` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `discussion_groups`
--

INSERT INTO `discussion_groups` (`id`, `course_id`, `class_id`, `title`, `created_at`) VALUES
(2, 22, 21, 'g11 maths', '2026-05-15 16:56:18');

-- --------------------------------------------------------

--
-- Table structure for table `discussion_messages`
--

CREATE TABLE `discussion_messages` (
  `id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `discussion_messages`
--

INSERT INTO `discussion_messages` (`id`, `topic_id`, `user_id`, `message`, `parent_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 3, 17, 'hello their', NULL, '2026-05-15 17:06:16', '2026-05-15 17:06:16', NULL),
(3, 3, 17, 'hello their', NULL, '2026-05-15 17:06:23', '2026-05-15 17:06:23', NULL),
(4, 3, 16, 'how are you ', NULL, '2026-05-15 17:10:40', '2026-05-15 17:10:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `discussion_topics`
--

CREATE TABLE `discussion_topics` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_by` int(11) NOT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `discussion_topics`
--

INSERT INTO `discussion_topics` (`id`, `group_id`, `title`, `created_by`, `status`, `created_at`) VALUES
(3, 2, 'General Discussion', 17, 'open', '2026-05-15 16:59:41');

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` int(11) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `is_published` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `category`, `is_published`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'How to submit?', 'Upload file.', 'Assn', 1, 11, '2026-05-09 08:21:15', '2026-05-09 08:21:15');

-- --------------------------------------------------------

--
-- Table structure for table `gap_analysis`
--

CREATE TABLE `gap_analysis` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `weak_topics` text NOT NULL,
  `improvement_recommendations` text NOT NULL,
  `risk_level` enum('low','medium','high') NOT NULL,
  `generated_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `attendance_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `overall_score` decimal(5,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `gap_analysis`
--

INSERT INTO `gap_analysis` (`id`, `student_id`, `course_id`, `weak_topics`, `improvement_recommendations`, `risk_level`, `generated_by`, `created_at`, `attendance_percentage`, `overall_score`) VALUES
(4, 10, 11, 'Requires fundamental review across all recent topics.', 'Immediate intervention required. Mandatory counseling and remedial classes.', 'high', 11, '2026-05-09 08:19:54', '0.00', '0.00'),
(5, 10, 11, 'Requires fundamental review across all recent topics.', 'Immediate intervention required. Mandatory counseling and remedial classes.', 'high', 11, '2026-05-09 08:20:32', '0.00', '0.00'),
(6, 10, 11, 'Requires fundamental review across all recent topics.', 'Immediate intervention required. Mandatory counseling and remedial classes.', 'high', 11, '2026-05-09 08:21:18', '0.00', '0.00'),
(10, 16, 22, 'Missing submissions: project managmnet', 'Improve class attendance (currently 50%). Attend all lectures and interactive discussions. Submit outstanding assignments (project managmnet) as soon as possible. Schedule study hours and seek assistance from the teacher or tutor.', 'high', 17, '2026-05-19 16:43:31', '50.00', '0.00'),
(11, 14, 22, 'Missing submissions: project managmnet', 'Improve class attendance (currently 0%). Attend all lectures and interactive discussions. Submit outstanding assignments (project managmnet) as soon as possible. Schedule study hours and seek assistance from the teacher or tutor.', 'high', 17, '2026-05-19 16:43:31', '0.00', '0.00'),
(12, 15, 22, 'Missing submissions: project managmnet', 'Submit outstanding assignments (project managmnet) as soon as possible. Schedule study hours and seek assistance from the teacher or tutor.', 'high', 17, '2026-05-19 16:43:31', '100.00', '0.00');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `marks` int(11) NOT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` int(11) NOT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `submission_id`, `marks`, `feedback`, `graded_by`, `published_at`, `created_at`) VALUES
(1, 10, 40, 'Low', 11, NULL, '2026-05-09 08:21:17');

-- --------------------------------------------------------

--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `login_logs`
--

INSERT INTO `login_logs` (`id`, `user_id`, `login_time`, `ip_address`) VALUES
(1, 1, '2026-05-09 16:14:34', '::1'),
(2, 1, '2026-05-09 16:32:37', '::1'),
(3, 6, '2026-05-09 16:33:03', '::1'),
(4, 5, '2026-05-09 16:34:21', '::1'),
(5, 12, '2026-05-09 18:02:18', '::1'),
(6, 12, '2026-05-09 19:33:00', '::1'),
(7, 12, '2026-05-11 05:53:39', '::1'),
(8, 17, '2026-05-11 10:05:00', '::1'),
(9, 17, '2026-05-11 16:21:07', '::1'),
(10, 12, '2026-05-11 16:37:24', '::1'),
(11, 17, '2026-05-11 16:50:03', '::1'),
(12, 12, '2026-05-11 17:23:30', '::1'),
(13, 12, '2026-05-12 02:23:37', '::1'),
(14, 12, '2026-05-12 02:23:52', '::1'),
(15, 12, '2026-05-12 02:24:16', '::1'),
(16, 17, '2026-05-12 03:13:56', '::1'),
(17, 12, '2026-05-12 03:17:50', '::1'),
(18, 17, '2026-05-12 03:40:43', '::1'),
(19, 17, '2026-05-12 03:42:14', '::1'),
(20, 6, '2026-05-12 04:00:59', '::1'),
(21, 12, '2026-05-12 05:05:54', '::1'),
(22, 16, '2026-05-12 05:06:30', '::1'),
(23, 17, '2026-05-12 05:23:02', '::1'),
(24, 12, '2026-05-12 06:22:11', '::1'),
(25, 17, '2026-05-12 06:29:06', '::1'),
(26, 16, '2026-05-12 06:35:14', '::1'),
(27, 17, '2026-05-12 06:55:51', '::1'),
(28, 16, '2026-05-12 06:57:17', '::1'),
(29, 17, '2026-05-12 07:01:57', '::1'),
(30, 16, '2026-05-13 04:48:01', '::1'),
(31, 17, '2026-05-13 05:29:41', '::1'),
(32, 16, '2026-05-13 05:32:22', '::1'),
(33, 17, '2026-05-13 05:35:58', '::1'),
(34, 12, '2026-05-13 11:56:13', '::1'),
(35, 16, '2026-05-13 11:59:33', '::1'),
(36, 17, '2026-05-13 12:00:34', '::1'),
(37, 17, '2026-05-15 16:41:47', '::1'),
(38, 16, '2026-05-15 17:06:34', '::1'),
(39, 17, '2026-05-15 17:10:58', '::1'),
(40, 16, '2026-05-15 17:11:17', '::1'),
(41, 17, '2026-05-15 17:32:18', '::1'),
(42, 17, '2026-05-19 16:15:30', '::1'),
(43, 16, '2026-05-19 16:56:33', '::1'),
(44, 12, '2026-05-19 16:57:54', '::1'),
(45, 12, '2026-05-22 17:30:23', '::1'),
(46, 23, '2026-05-22 17:48:50', '::1'),
(47, 23, '2026-05-31 18:41:44', '::1'),
(48, 12, '2026-06-03 09:08:09', '::1');

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `cloudinary_url` varchar(500) NOT NULL,
  `public_id` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id`, `title`, `description`, `subject_id`, `class_id`, `uploaded_by`, `cloudinary_url`, `public_id`, `file_type`, `file_size`, `status`, `created_at`, `updated_at`) VALUES
(1, 'php', 'web backend ', 22, 21, 17, 'https://res.cloudinary.com/dkncow1mu/raw/upload/v1778567489/millennium/materials/mehsqdh181yzbtics8p1.tmp', 'millennium/materials/mehsqdh181yzbtics8p1.tmp', 'raw', 4149137, 'active', '2026-05-12 06:31:30', '2026-05-12 06:31:30');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('assignment','grade','attendance','discussion','announcement','system','event','warning') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `reference_type`, `reference_id`, `is_read`, `priority`, `created_at`) VALUES
(1, 10, 'assignment', 'New Assignment', 'A new assignment \'Newton Laws\' has been posted.', 'assignment', 1, 1, 'high', '2026-05-09 08:21:14'),
(2, 10, 'system', 'Support Ticket Created', 'Your ticket #1 has been created successfully.', NULL, NULL, 0, 'medium', '2026-05-09 08:21:15'),
(3, 10, 'system', 'New Reply to Ticket #1', 'A support agent has replied to your ticket.', NULL, NULL, 0, 'medium', '2026-05-09 08:21:16'),
(4, 10, 'grade', 'Grade Published', 'Your grade for Newton Laws has been published.', 'submission', 10, 0, 'high', '2026-05-09 08:21:17'),
(5, 10, 'system', 'Performance Alert', 'Your academic performance is currently marked as poor. Please consult your teacher.', NULL, NULL, 0, 'medium', '2026-05-09 08:21:17'),
(6, 10, 'system', 'Academic Risk Warning', 'You have been identified as High Risk in course ID 11. Please speak with your teacher immediately.', NULL, NULL, 0, 'medium', '2026-05-09 08:21:18'),
(7, 14, 'assignment', 'New Assignment', 'A new assignment \'project managmnet\' has been posted.', 'assignment', 2, 0, 'high', '2026-05-12 06:56:58'),
(8, 14, 'attendance', 'Attendance Alert', 'You were marked absent today. Current attendance: 0%', NULL, NULL, 0, 'medium', '2026-05-13 04:47:31'),
(9, 14, 'attendance', 'Attendance Alert', 'You were marked absent today. Current attendance: 0%', NULL, NULL, 0, 'medium', '2026-05-13 04:47:45'),
(10, 14, 'attendance', 'Attendance Alert', 'You were marked absent today. Current attendance: 0%', NULL, NULL, 0, 'medium', '2026-05-13 05:31:20'),
(11, 16, 'attendance', 'Attendance Alert', 'You were marked absent today. Current attendance: 0%', NULL, NULL, 0, 'medium', '2026-05-13 05:31:20'),
(12, 14, 'attendance', 'Attendance Alert', 'You were marked absent today. Current attendance: 0%', NULL, NULL, 0, 'medium', '2026-05-15 17:37:18'),
(13, 16, 'system', 'Academic Risk Warning', 'You have been identified as High Risk in course ID 22. Please speak with your teacher immediately.', NULL, NULL, 0, 'medium', '2026-05-19 16:43:31'),
(14, 14, 'system', 'Academic Risk Warning', 'You have been identified as High Risk in course ID 22. Please speak with your teacher immediately.', NULL, NULL, 0, 'medium', '2026-05-19 16:43:31'),
(15, 15, 'system', 'Academic Risk Warning', 'You have been identified as High Risk in course ID 22. Please speak with your teacher immediately.', NULL, NULL, 0, 'medium', '2026-05-19 16:43:31'),
(16, 16, 'system', 'Academic Risk Warning', 'You have been identified as High Risk in course ID 22. Please speak with your teacher immediately.', NULL, NULL, 0, 'medium', '2026-05-19 16:43:31'),
(17, 14, 'system', 'Academic Risk Warning', 'You have been identified as High Risk in course ID 22. Please speak with your teacher immediately.', NULL, NULL, 0, 'medium', '2026-05-19 16:43:31'),
(18, 15, 'system', 'Academic Risk Warning', 'You have been identified as High Risk in course ID 22. Please speak with your teacher immediately.', NULL, NULL, 0, 'medium', '2026-05-19 16:43:32');

-- --------------------------------------------------------

--
-- Table structure for table `parent_student`
--

CREATE TABLE `parent_student` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `relationship_type` enum('father','mother','guardian') DEFAULT 'guardian',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `parent_student`
--

INSERT INTO `parent_student` (`id`, `parent_id`, `student_id`, `relationship_type`, `created_at`) VALUES
(1, 20, 19, 'mother', '2026-05-22 17:27:37'),
(2, 23, 16, 'father', '2026-05-22 17:48:15');

-- --------------------------------------------------------

--
-- Table structure for table `performance_reports`
--

CREATE TABLE `performance_reports` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `assignment_average` decimal(5,2) DEFAULT 0.00,
  `quiz_average` decimal(5,2) DEFAULT 0.00,
  `exam_average` decimal(5,2) DEFAULT 0.00,
  `attendance_percentage` decimal(5,2) DEFAULT 0.00,
  `overall_score` decimal(5,2) DEFAULT 0.00,
  `performance_level` enum('excellent','good','average','poor') NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `performance_reports`
--

INSERT INTO `performance_reports` (`id`, `student_id`, `course_id`, `assignment_average`, `quiz_average`, `exam_average`, `attendance_percentage`, `overall_score`, `performance_level`, `generated_at`) VALUES
(4, 10, 11, '40.00', '40.00', '40.00', '0.00', '40.00', 'poor', '2026-05-09 08:19:54'),
(5, 10, 11, '40.00', '40.00', '40.00', '0.00', '40.00', 'poor', '2026-05-09 08:20:32'),
(6, 10, 11, '40.00', '40.00', '40.00', '0.00', '40.00', 'poor', '2026-05-09 08:21:17');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`) VALUES
(1, 'ADMIN'),
(4, 'PARENT'),
(3, 'STUDENT'),
(2, 'TEACHER');

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `submission_file_url` varchar(500) DEFAULT NULL,
  `submission_file_public_id` varchar(255) DEFAULT NULL,
  `answer_text` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','graded','late') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`id`, `assignment_id`, `student_id`, `submission_file_url`, `submission_file_public_id`, `answer_text`, `submitted_at`, `status`) VALUES
(10, 1, 10, NULL, NULL, NULL, '2026-05-09 08:21:16', 'graded');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `category` enum('technical','account','assignment','attendance','grading','system','other') NOT NULL,
  `message` text NOT NULL,
  `status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `subject`, `category`, `message`, `status`, `priority`, `assigned_to`, `created_at`, `updated_at`) VALUES
(1, 10, 'Help', 'technical', 'Fails', 'open', 'medium', NULL, '2026-05-09 08:21:15', '2026-05-09 08:21:16');

-- --------------------------------------------------------

--
-- Table structure for table `support_ticket_replies`
--

CREATE TABLE `support_ticket_replies` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `support_ticket_replies`
--

INSERT INTO `support_ticket_replies` (`id`, `ticket_id`, `user_id`, `message`, `created_at`) VALUES
(1, 1, 11, 'Fixed', '2026-05-09 08:21:16');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_assignments`
--

CREATE TABLE `teacher_assignments` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `teacher_assignments`
--

INSERT INTO `teacher_assignments` (`id`, `teacher_id`, `course_id`, `class_id`, `created_at`) VALUES
(7, 17, 22, 21, '2026-05-12 03:12:50'),
(8, 17, 22, 13, '2026-05-12 03:12:50'),
(9, 6, 22, 21, '2026-05-12 04:13:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `class_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `username`, `email`, `password`, `role_id`, `student_id`, `employee_id`, `phone_number`, `gender`, `status`, `class_id`, `created_at`, `updated_at`) VALUES
(1, 'System Administrator', 'admin', 'admin@millennium.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NULL, NULL, NULL, NULL, 'active', NULL, '2026-05-09 08:00:14', '2026-05-09 16:14:17'),
(5, 'Student Five', 'student5', '5@t.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, NULL, NULL, NULL, NULL, 'active', NULL, '2026-05-09 08:11:57', '2026-05-09 16:14:17'),
(6, 'Teacher Six', 'teacher6', '6@t.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, NULL, NULL, NULL, NULL, 'active', NULL, '2026-05-09 08:11:57', '2026-05-09 16:14:17'),
(10, 'John Student', 'student10', 'student10@t.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, NULL, NULL, NULL, NULL, 'active', NULL, '2026-05-09 08:21:14', '2026-05-12 02:59:33'),
(11, 'Dr. Teacher', 'teacher11', 'teacher11@t.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, NULL, NULL, NULL, NULL, 'active', NULL, '2026-05-09 08:21:14', '2026-05-09 16:14:17'),
(12, 'Hab Admin', 'habadmin', 'hab@admin.com', '$2y$10$2/jC7Gn/MPNgzuNaXuCVN.Z4pFrrA8oRXplVXjVMUmzlBjyGHxNLS', 1, NULL, NULL, NULL, NULL, 'active', NULL, '2026-05-09 17:01:28', '2026-05-12 02:22:22'),
(13, 'Hab', 'stu1', 'habbef0@gmail.com', '$2y$10$Xr6GA7jzjYIGHYA5wLyu1OiPNMbLXU8g0X6Fb69cgut6trqaPGxpq', 3, NULL, NULL, NULL, NULL, 'active', NULL, '2026-05-09 19:55:43', '2026-05-12 02:59:33'),
(14, 'henok kebede', 'henok', 'henok@gmail.com', '$2y$10$oKoEe5WH2yaJU7N6FHABqOmmRAo50aKIcSWjzQea5PC/35R1sp6my', 3, NULL, NULL, NULL, NULL, 'active', 21, '2026-05-11 05:56:37', '2026-05-12 03:06:37'),
(15, 'melat kassahun', 'melat', 'melat@gmail.com', '$2y$10$QjCiZHVekCpnPUyka5h56.rpn68LXSGLQceB3W1wV9sjNEiGqhZgq', 3, NULL, NULL, NULL, NULL, 'active', 21, '2026-05-11 05:57:23', '2026-05-12 03:06:50'),
(16, 'habtamu shewamene', 'habte', 'habtamubefekadu19@gmail.com', '$2y$10$gsnK4Pu8R2M9yJoP/xTYJel4WFUPfSF10slKkOUcuAXkcb1NAk1Fu', 3, NULL, NULL, NULL, NULL, 'active', 21, '2026-05-11 05:58:16', '2026-05-22 17:38:32'),
(17, 'Demeke', 'demeke', 'demeke@gmail.com', '$2y$10$p9Xlr8ei/XGYUjxgqwcFoO5G0yTUlqZ07wrEbxbelILfn5vD5GAza', 2, NULL, NULL, NULL, NULL, 'active', NULL, '2026-05-11 05:59:34', '2026-05-11 05:59:34'),
(19, 'Test Student', 'test_student_482', 'student131@test.com', '$2y$10$sUmjPv0ENUuQgxGiCfhWG.rl4wWSPMAu5xofroFiTguLlR7XHmWiG', 3, NULL, NULL, NULL, NULL, 'active', NULL, '2026-05-22 17:27:37', '2026-05-22 17:27:37'),
(20, 'Test Parent', 'parent648_834', 'parent648@test.com', '$2y$10$HbuXeC8ARIQDFKDH5.cE2elpTotgUTiwrOekDr7RDg3MPQZ6f/2pO', 4, NULL, NULL, NULL, NULL, 'active', NULL, '2026-05-22 17:27:37', '2026-05-22 17:27:37'),
(23, 'shewamene  haile', 'h_333', 'h@gmail.com', '$2y$10$O4Ms5zGnChx/FPVOSjAI.ekaoYFdH28grR5jDz5xm.W5YGI1etBwy', 4, NULL, NULL, NULL, NULL, 'active', NULL, '2026-05-22 17:48:15', '2026-05-22 17:48:15');

-- --------------------------------------------------------

--
-- Table structure for table `user_guides`
--

CREATE TABLE `user_guides` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `content` text NOT NULL,
  `target_role` enum('student','teacher','admin','all') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance` (`student_id`,`course_id`,`attendance_date`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `class_course_assignments`
--
ALTER TABLE `class_course_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_course` (`class_id`,`course_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `course_teacher_pool`
--
ALTER TABLE `course_teacher_pool`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_course_teacher` (`course_id`,`teacher_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `department_teacher_assignments`
--
ALTER TABLE `department_teacher_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_teacher_department` (`teacher_id`),
  ADD UNIQUE KEY `unique_department_teacher` (`department_id`,`teacher_id`);

--
-- Indexes for table `discussion_groups`
--
ALTER TABLE `discussion_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_id` (`course_id`),
  ADD UNIQUE KEY `unique_course_class` (`course_id`,`class_id`),
  ADD KEY `fk_discussion_groups_class` (`class_id`);

--
-- Indexes for table `discussion_messages`
--
ALTER TABLE `discussion_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `topic_id` (`topic_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `discussion_topics`
--
ALTER TABLE `discussion_topics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `group_id` (`group_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `gap_analysis`
--
ALTER TABLE `gap_analysis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `generated_by` (`generated_by`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `submission_id` (`submission_id`),
  ADD KEY `graded_by` (`graded_by`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `parent_student`
--
ALTER TABLE `parent_student`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_parent_student` (`parent_id`,`student_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `performance_reports`
--
ALTER TABLE `performance_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignment_id` (`assignment_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `support_ticket_replies`
--
ALTER TABLE `support_ticket_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`teacher_id`,`course_id`,`class_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `user_guides`
--
ALTER TABLE `user_guides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `class_course_assignments`
--
ALTER TABLE `class_course_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `course_teacher_pool`
--
ALTER TABLE `course_teacher_pool`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `department_teacher_assignments`
--
ALTER TABLE `department_teacher_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `discussion_groups`
--
ALTER TABLE `discussion_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `discussion_messages`
--
ALTER TABLE `discussion_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `discussion_topics`
--
ALTER TABLE `discussion_topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `gap_analysis`
--
ALTER TABLE `gap_analysis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `parent_student`
--
ALTER TABLE `parent_student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `performance_reports`
--
ALTER TABLE `performance_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `support_ticket_replies`
--
ALTER TABLE `support_ticket_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `user_guides`
--
ALTER TABLE `user_guides`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcements_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_records_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `class_course_assignments`
--
ALTER TABLE `class_course_assignments`
  ADD CONSTRAINT `class_course_assignments_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_course_assignments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_course_assignments_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_course_assignments_ibfk_4` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_teacher_pool`
--
ALTER TABLE `course_teacher_pool`
  ADD CONSTRAINT `course_teacher_pool_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_teacher_pool_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `department_teacher_assignments`
--
ALTER TABLE `department_teacher_assignments`
  ADD CONSTRAINT `department_teacher_assignments_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `department_teacher_assignments_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `discussion_groups`
--
ALTER TABLE `discussion_groups`
  ADD CONSTRAINT `discussion_groups_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_discussion_groups_class` FOREIGN KEY (`class_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `discussion_messages`
--
ALTER TABLE `discussion_messages`
  ADD CONSTRAINT `discussion_messages_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `discussion_topics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `discussion_messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `discussion_messages_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `discussion_messages` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `discussion_topics`
--
ALTER TABLE `discussion_topics`
  ADD CONSTRAINT `discussion_topics_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `discussion_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `discussion_topics_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faqs`
--
ALTER TABLE `faqs`
  ADD CONSTRAINT `faqs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `gap_analysis`
--
ALTER TABLE `gap_analysis`
  ADD CONSTRAINT `gap_analysis_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gap_analysis_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gap_analysis_ibfk_3` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD CONSTRAINT `login_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `materials_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `materials_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `materials_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `parent_student`
--
ALTER TABLE `parent_student`
  ADD CONSTRAINT `parent_student_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `parent_student_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `performance_reports`
--
ALTER TABLE `performance_reports`
  ADD CONSTRAINT `performance_reports_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `performance_reports_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `support_tickets_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `support_ticket_replies`
--
ALTER TABLE `support_ticket_replies`
  ADD CONSTRAINT `support_ticket_replies_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `support_ticket_replies_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD CONSTRAINT `teacher_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_assignments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_assignments_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_guides`
--
ALTER TABLE `user_guides`
  ADD CONSTRAINT `user_guides_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
