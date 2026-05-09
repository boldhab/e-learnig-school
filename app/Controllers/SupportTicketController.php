<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\HelpSupportService;
use App\Helpers\HtmlSanitizer;
use Exception;

class SupportTicketController extends BaseController {
    protected $helpService;

    public function __construct() {
        $this->helpService = new HelpSupportService();
    }

    public function create(Request $request, Response $response) {
        $this->requireAuth();
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['user_id'] = $GLOBALS['auth_user']['id'];
        
        try {
            $id = $this->helpService->createTicket($data);
            $this->success(['id' => $id], 'Support ticket created successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function list(Request $request, Response $response) {
        $this->requireAuth();
        
        $currentUser = $GLOBALS['auth_user'];
        
        try {
            // Admin can see all tickets, others see only their own
            if ($currentUser['role_id'] == 1) {
                $tickets = $this->helpService->getAllTickets();
            } else {
                $tickets = $this->helpService->getUserTickets($currentUser['id']);
            }
            $this->success($tickets, 'Support tickets retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function get(Request $request, Response $response, $id) {
        $this->requireAuth();
        
        $currentUser = $GLOBALS['auth_user'];
        
        try {
            $ticket = $this->helpService->getTicketDetails($id);
            if (!$ticket) {
                $this->error('Ticket not found', 404);
            }
            
            // Check access
            if ($currentUser['role_id'] != 1 && $ticket['user_id'] != $currentUser['id']) {
                $this->error('Forbidden: You can only view your own tickets', 403);
            }

            $this->success($ticket, 'Support ticket retrieved successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function reply(Request $request, Response $response, $id) {
        $this->requireAuth();
        
        $data = HtmlSanitizer::sanitize($request->getBody());
        $data['ticket_id'] = $id;
        $data['user_id'] = $GLOBALS['auth_user']['id'];
        
        try {
            $replyId = $this->helpService->replyToTicket($data);
            $this->success(['id' => $replyId], 'Reply added successfully', 201);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }

    public function updateStatus(Request $request, Response $response, $id) {
        $this->requireRole('ADMIN');
        
        $params = $request->getBody();
        if (empty($params['status'])) {
            $this->error('Status is required', 400);
        }

        try {
            $this->helpService->updateTicketStatus($id, $params['status']);
            $this->success([], 'Ticket status updated successfully');
        } catch (Exception $e) {
            $this->error($e->getMessage(), 400);
        }
    }
}
