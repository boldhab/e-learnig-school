<?php

namespace App\Services;

use App\Repositories\AssignmentRepository;
use App\Repositories\UserRepository;
use App\Helpers\CloudinaryHelper;
use App\Core\Database;
use Exception;
use PDO;

class AssignmentService {
    protected $assignmentRepository;
    protected $userRepository;
    protected $cloudinaryHelper;
    protected $notificationService;
    protected $db;

    public function __construct() {
        $this->assignmentRepository = new AssignmentRepository();
        $this->userRepository = new UserRepository();
        $this->cloudinaryHelper = new CloudinaryHelper();
        $this->notificationService = new NotificationService();
        $this->db = Database::getInstance();
    }

    public function createAssignment($data, $file = null) {
        if ($file && $file['size'] > 0) {
            $cloudinaryResult = $this->cloudinaryHelper->upload($file['tmp_name'], 'raw', [
                'folder' => 'millennium/assignments',
                'resource_type' => 'raw'
            ]);

            if (isset($cloudinaryResult['secure_url'])) {
                $data['file_url'] = $cloudinaryResult['secure_url'];
                $data['file_public_id'] = $cloudinaryResult['public_id'];
                $data['file_type'] = $file['type'];
            }
        }

        $id = $this->assignmentRepository->create($data);

        if ($id) {
            // STEP H-01: Automatic Assignment Notification
            // Find all classes this course is assigned to
            $stmt = $this->db->prepare("SELECT class_id FROM teacher_assignments WHERE course_id = ?");
            $stmt->execute([$data['course_id']]);
            $classIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            foreach ($classIds as $classId) {
                $studentIds = $this->userRepository->getStudentsByClass($classId);
                foreach ($studentIds as $studentId) {
                    $this->notificationService->notifyAssignmentCreated($studentId, $id, $data['title']);
                }
            }
        }

        return $id;
    }

    public function getAssignment($id) {
        return $this->assignmentRepository->findById($id);
    }

    public function listAssignments($courseId = null) {
        return $this->assignmentRepository->getAll($courseId);
    }

    public function updateAssignment($id, $data) {
        return $this->assignmentRepository->update($id, $data);
    }

    public function deleteAssignment($id) {
        $assignment = $this->assignmentRepository->findById($id);
        if ($assignment && $assignment['file_public_id']) {
            $this->cloudinaryHelper->delete($assignment['file_public_id'], 'raw');
        }
        return $this->assignmentRepository->delete($id);
    }
}
