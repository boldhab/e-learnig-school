<?php

namespace App\Services;

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
            $title .= " – " . $sectionName;
        }
        return $this->groupRepo->create($courseId, $title);
    }

    public function getGroupForCourse($courseId) {
        $group = $this->groupRepo->findByCourseId($courseId);
        if (!$group) {
            throw new Exception("Discussion group not found for this course.");
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
        
        // Fetch full message with author info for broadcasting
        $messages = $this->messageRepo->getByTopic($data['topic_id']);
        $fullMessage = null;
        foreach ($messages as $m) {
            if ($m['id'] == $id) {
                $fullMessage = $m;
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
}
