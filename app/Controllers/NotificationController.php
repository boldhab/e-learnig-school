<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\NotificationService;
use Exception;

class NotificationController extends BaseController {
    protected $notificationService;

    public function __construct() {
        $this->notificationService = new NotificationService();
    }

    public function getNotifications(Request $request, Response $response) {
        $this->requireAuth();
        
        $params = $request->getBody();
        $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
        $offset = isset($params['offset']) ? (int)$params['offset'] : 0;
        
        try {
            $notifications = $this->notificationService->getUserNotifications($GLOBALS['auth_user']['id'], $limit, $offset);
            $this->success($notifications, 'Notifications retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function getUnreadCount(Request $request, Response $response) {
        $this->requireAuth();
        
        try {
            $count = $this->notificationService->getUnreadCount($GLOBALS['auth_user']['id']);
            $this->success(['unread_count' => $count], 'Unread count retrieved');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function markAsRead(Request $request, Response $response, $id) {
        $this->requireAuth();
        
        try {
            $success = $this->notificationService->markAsRead($id, $GLOBALS['auth_user']['id']);
            if ($success) {
                $this->success([], 'Notification marked as read');
            } else {
                $this->error('Notification not found or access denied', 404);
            }
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function markAllAsRead(Request $request, Response $response) {
        $this->requireAuth();
        
        try {
            $this->notificationService->markAllAsRead($GLOBALS['auth_user']['id']);
            $this->success([], 'All notifications marked as read');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function delete(Request $request, Response $response, $id) {
        $this->requireAuth();

        try {
            $success = $this->notificationService->deleteNotification((int)$id, $GLOBALS['auth_user']['id']);
            if ($success) {
                $this->success([], 'Notification deleted');
            } else {
                $this->error('Notification not found or access denied', 404);
            }
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }
}
