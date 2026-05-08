<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\DiscussionService;
use App\Helpers\HtmlSanitizer;
use Exception;

class DiscussionController extends BaseController {
    protected $discussionService;

    public function __construct() {
        $this->discussionService = new DiscussionService();
    }

    public function getCourseDiscussion(Request $request, Response $response, $courseId) {
        $this->requireAuth();
        try {
            $group = $this->discussionService->getGroupForCourse($courseId);
            $this->success($group);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 404);
        }
    }

    public function createTopic(Request $request, Response $response, $groupId) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['group_id'] = $groupId;
        $data['created_by'] = $GLOBALS['auth_user']['id'];

        try {
            $id = $this->discussionService->createTopic($data);
            $this->success(['topic_id' => $id], 'Topic created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function listTopics(Request $request, Response $response, $groupId) {
        $this->requireAuth();
        $topics = $this->discussionService->getTopics($groupId);
        $this->success($topics);
    }

    public function postMessage(Request $request, Response $response, $topicId) {
        $this->requireAuth();
        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['topic_id'] = $topicId;
        $data['user_id'] = $GLOBALS['auth_user']['id'];

        try {
            $id = $this->discussionService->postMessage($data);
            $this->success(['message_id' => $id], 'Message posted successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function listMessages(Request $request, Response $response, $topicId) {
        $this->requireAuth();
        $messages = $this->discussionService->getMessages($topicId);
        $this->success($messages);
    }

    public function deleteMessage(Request $request, Response $response, $messageId) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        try {
            $this->discussionService->moderateMessage($messageId);
            $this->success([], 'Message deleted by moderator');
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function closeTopic(Request $request, Response $response, $topicId) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        $this->discussionService->updateTopicStatus($topicId, 'closed');
        $this->success([], 'Topic closed');
    }

    public function openTopic(Request $request, Response $response, $topicId) {
        $this->requireRole(['ADMIN', 'TEACHER']);
        $this->discussionService->updateTopicStatus($topicId, 'open');
        $this->success([], 'Topic opened');
    }
}
