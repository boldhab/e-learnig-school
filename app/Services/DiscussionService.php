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

    public function createTopic($data) {
        if (empty($data['title'])) {
            throw new Exception("Topic title is required.");
        }
        return $this->topicRepo->create($data);
    }

    public function getTopics($groupId) {
        return $this->topicRepo->findByGroup($groupId);
    }

    public function postMessage($data) {
        $topic = $this->topicRepo->findById($data['topic_id']);
        if (!$topic) {
            throw new Exception("Topic not found.");
        }
        if ($topic['status'] === 'closed') {
            throw new Exception("This topic is closed for new messages.");
        }
        return $this->messageRepo->create($data);
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
}
