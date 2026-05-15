<?php

namespace App\Services;

use App\Core\Database;
use App\Repositories\DiscussionGroupRepository;
use App\Repositories\DiscussionTopicRepository;
use App\Repositories\DiscussionMessageRepository;
use Exception;

class DiscussionService {
    protected $groupRepo;
    protected $topicRepo;
    protected $messageRepo;

    public function __construct() {
        $this->groupRepo = new DiscussionGroupRepository();
        $this->topicRepo = new DiscussionTopicRepository();
        $this->messageRepo = new DiscussionMessageRepository();
    }

    /**
     * Triggered when a course is created
     */
    public function autoCreateGroup($courseId, $courseName, $sectionName = null) {
        $title = $courseName;
        if ($sectionName) {
            $title .= " - " . $sectionName;
        }
        return $this->groupRepo->create($courseId, null, $title);
    }

    public function getGroupForCourse($courseId) {
        $group = $this->groupRepo->findByCourseId($courseId);
        if (!$group) {
            throw new Exception("Discussion group not found for this course.");
        }
        return $group;
    }

    public function createGroup($courseId, $classId, $title, $userId, $role) {
        $courseId = (int) $courseId;
        $classId = (int) $classId;

        if ($courseId <= 0) {
            throw new Exception("Valid course ID is required.");
        }

        if ($classId <= 0) {
            throw new Exception("Valid class ID is required.");
        }

        $title = trim((string) $title);
        if ($title === '') {
            throw new Exception("Group title is required.");
        }

        if ($role === 'TEACHER' && !$this->teacherHasCourseAccess((int) $userId, $courseId, $classId)) {
            throw new Exception("You are not assigned to this course and class.");
        }

        $existingGroup = $this->groupRepo->findByCourseAndClass($courseId, $classId);
        if ($existingGroup) {
            throw new Exception("A discussion group already exists for this course and class.");
        }

        $this->groupRepo->create($courseId, $classId, $title);
        $group = $this->groupRepo->findByCourseAndClass($courseId, $classId);

        if (!$group) {
            throw new Exception("Failed to create discussion group.");
        }

        // Create a starter thread so opening a new group immediately shows a chat topic.
        $existingTopics = $this->topicRepo->findByGroup($group['id']);
        if (empty($existingTopics)) {
            $this->topicRepo->create([
                'group_id' => $group['id'],
                'title' => 'General Discussion',
                'created_by' => (int) $userId,
                'status' => 'open',
            ]);
        }

        return $group;
    }

    public function getUserGroups($userId, $role, $classId = null) {
        if ($role === 'ADMIN') {
            return $this->groupRepo->getAllGroups();
        }

        if ($role === 'TEACHER') {
            return $this->groupRepo->getGroupsByTeacher($userId);
        }

        if ($role === 'STUDENT') {
            if (!$classId) {
                return [];
            }
            return $this->groupRepo->getGroupsByStudent($classId);
        }

        return [];
    }

    public function createTopic($data) {
        if (empty($data['title'])) {
            throw new Exception("Topic title is required.");
        }
        return $this->topicRepo->create($data);
    }

    public function getTopics($groupId) {
        return $this->topicRepo->findByGroup($groupId);
    }

    public function postMessage($data, ?string $socketId = null) {
        $topic = $this->topicRepo->findById($data['topic_id']);
        if (!$topic) {
            throw new Exception("Topic not found.");
        }
        if ($topic['status'] === 'closed') {
            throw new Exception("This topic is closed for new messages.");
        }

        $id = $this->messageRepo->create($data);

        $messages = $this->messageRepo->getByTopic($data['topic_id']);
        $fullMessage = null;
        foreach ($messages as $message) {
            if ($message['id'] == $id) {
                $fullMessage = $message;
                break;
            }
        }

        if ($fullMessage) {
            event(new \App\Events\Discussion\NewMessageEvent($fullMessage), $socketId);
        }

        return $id;
    }

    public function getMessages($topicId) {
        return $this->messageRepo->getByTopic($topicId);
    }

    public function moderateMessage($messageId) {
        return $this->messageRepo->softDelete($messageId);
    }

    public function updateTopicStatus($topicId, $status) {
        return $this->topicRepo->updateStatus($topicId, $status);
    }

    public function deleteTopic($topicId) {
        $topic = $this->topicRepo->findById($topicId);
        if (!$topic) {
            throw new Exception("Topic not found.");
        }

        return $this->topicRepo->delete($topicId);
    }

    protected function teacherHasCourseAccess(int $teacherId, int $courseId, int $classId): bool {
        $db = Database::getInstance();
        $stmt = $db->prepare("SELECT COUNT(*) FROM teacher_assignments WHERE teacher_id = :teacher_id AND course_id = :course_id AND class_id = :class_id");
        $stmt->execute([
            'teacher_id' => $teacherId,
            'course_id' => $courseId,
            'class_id' => $classId,
        ]);

        return (int) $stmt->fetchColumn() > 0;
    }
}
