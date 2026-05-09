<?php

namespace App\Services;

use App\Repositories\AnnouncementRepository;
use Exception;

class AnnouncementService {
    protected $announcementRepo;

    public function __construct() {
        $this->announcementRepo = new AnnouncementRepository();
    }

    public function createAnnouncement(array $data): int {
        if (empty($data['title']) || empty($data['message']) || empty($data['target_role'])) {
            throw new Exception("Title, message, and target role are required.");
        }
        return $this->announcementRepo->create($data);
    }

    public function getAnnouncements(string $role, ?int $courseId = null): array {
        return $this->announcementRepo->getActiveAnnouncements($role, $courseId);
    }

    public function deleteAnnouncement(int $id): bool {
        return $this->announcementRepo->delete($id);
    }
}
