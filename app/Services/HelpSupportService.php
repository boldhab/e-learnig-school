<?php

namespace App\Services;

use App\Repositories\FAQRepository;
use App\Repositories\SupportTicketRepository;
use App\Repositories\UserGuideRepository;
use Exception;

class HelpSupportService {
    protected $faqRepo;
    protected $ticketRepo;
    protected $guideRepo;
    protected $notificationService;

    public function __construct() {
        $this->faqRepo = new FAQRepository();
        $this->ticketRepo = new SupportTicketRepository();
        $this->guideRepo = new UserGuideRepository();
        $this->notificationService = new NotificationService();
    }

    // --- FAQs ---
    public function createFAQ(array $data): int {
        return $this->faqRepo->create($data);
    }

    public function updateFAQ(int $id, array $data): bool {
        return $this->faqRepo->update($id, $data);
    }

    public function getFAQs(): array {
        return $this->faqRepo->getPublishedFAQs();
    }

    public function searchFAQs(string $query): array {
        return $this->faqRepo->search($query);
    }

    // --- Support Tickets ---
    public function createTicket(array $data): int {
        if (empty($data['subject']) || empty($data['category']) || empty($data['message'])) {
            throw new Exception("Subject, category, and message are required.");
        }
        $ticketId = $this->ticketRepo->createTicket($data);

        // Notify admins about new ticket
        // Assuming admin users could be fetched here, but we will simplify
        $this->notificationService->sendNotification(
            $data['user_id'], // In a real scenario, this would go to admins
            "Support Ticket Created",
            "Your ticket #{$ticketId} has been created successfully.",
            "system"
        );

        return $ticketId;
    }

    public function replyToTicket(array $data): int {
        if (empty($data['ticket_id']) || empty($data['message'])) {
            throw new Exception("Ticket ID and message are required.");
        }
        
        $ticket = $this->ticketRepo->getTicketById($data['ticket_id']);
        if (!$ticket) {
            throw new Exception("Ticket not found.");
        }

        $replyId = $this->ticketRepo->createReply($data);

        // Notify ticket owner if replied by someone else
        if ($ticket['user_id'] != $data['user_id']) {
            $this->notificationService->sendNotification(
                $ticket['user_id'],
                "New Reply to Ticket #{$data['ticket_id']}",
                "A support agent has replied to your ticket.",
                "system"
            );
        }

        return $replyId;
    }

    public function updateTicketStatus(int $id, string $status): bool {
        $validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid status.");
        }
        
        $success = $this->ticketRepo->updateStatus($id, $status);
        
        if ($success) {
            $ticket = $this->ticketRepo->getTicketById($id);
            if ($ticket) {
                $this->notificationService->sendNotification(
                    $ticket['user_id'],
                    "Ticket Status Updated",
                    "Your ticket #{$id} is now {$status}.",
                    "system"
                );
            }
        }
        
        return $success;
    }

    public function getUserTickets(int $userId): array {
        return $this->ticketRepo->getUserTickets($userId);
    }

    public function getAllTickets(): array {
        return $this->ticketRepo->getAllTickets();
    }

    public function getTicketDetails(int $id): ?array {
        return $this->ticketRepo->getTicketById($id);
    }

    // --- User Guides ---
    public function createGuide(array $data): int {
        return $this->guideRepo->create($data);
    }

    public function getGuides(string $role): array {
        return $this->guideRepo->getGuidesByRole($role);
    }
}
