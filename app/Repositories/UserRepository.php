<?php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class UserRepository {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function createUser($data) {
        $sql = "INSERT INTO users (full_name, username, email, password, role_id, student_id, employee_id, phone_number, gender, status) 
                VALUES (:full_name, :username, :email, :password, :role_id, :student_id, :employee_id, :phone_number, :gender, :status)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'full_name' => $data['full_name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => $data['password'], // Already hashed
            'role_id' => $data['role_id'],
            'student_id' => $data['student_id'] ?? null,
            'employee_id' => $data['employee_id'] ?? null,
            'phone_number' => $data['phone_number'] ?? null,
            'gender' => $data['gender'] ?? null,
            'status' => $data['status'] ?? 'active'
        ]);

        return $this->db->lastInsertId();
    }

    public function findByUsernameOrEmail($login) {
        $sql = "SELECT u.*, r.role_name FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.username = ? OR u.email = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$login, $login]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $sql = "SELECT u.*, r.role_name FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function getAllUsers() {
        $sql = "SELECT u.id, u.full_name, u.username, u.email, r.role_name, u.status, u.created_at, u.class_id,
                cl.name as class_name,
                (SELECT GROUP_CONCAT(sub.name SEPARATOR ', ') 
                 FROM teacher_assignments ta 
                 JOIN categories sub ON ta.course_id = sub.id 
                 WHERE ta.teacher_id = u.id) as subjects
                FROM users u 
                JOIN roles r ON u.role_id = r.id
                LEFT JOIN categories cl ON u.class_id = cl.id";
        return $this->db->query($sql)->fetchAll();
    }

    public function updateUser($id, $data) {
        $fields = [];
        $params = ['id' => $id];
        
        foreach ($data as $key => $value) {
            if ($key !== 'id') {
                $fields[] = "$key = :$key";
                $params[$key] = $value;
            }
        }
        
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function deleteUser($id) {
        $sql = "DELETE FROM users WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function changeStatus($id, $status) {
        $sql = "UPDATE users SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id, 'status' => $status]);
    }

    public function logLogin($userId, $ip) {
        $sql = "INSERT INTO login_logs (user_id, ip_address) VALUES (:user_id, :ip)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId, 'ip' => $ip]);
    }

    public function assignToClass($userId, $classId) {
        $sql = "UPDATE users SET class_id = :class_id WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $userId, 'class_id' => $classId]);
    }

    public function getStudentsByClass($classId) {
        $sql = "SELECT id FROM users WHERE class_id = :class_id AND role_id = (SELECT id FROM roles WHERE role_name = 'STUDENT')";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['class_id' => $classId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
