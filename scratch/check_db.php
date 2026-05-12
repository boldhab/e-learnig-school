<?php
require_once 'app/Core/Database.php';
// Mock simple DB connection if Core/Database is too complex to load manually
try {
    $db = new PDO('mysql:host=localhost;dbname=millennium_db', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "--- Teacher Assignments ---\n";
    $stmt = $db->query("SELECT * FROM teacher_assignments");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

    echo "\n--- Students ---\n";
    $stmt = $db->query("SELECT id, full_name, class_id FROM users WHERE role_id = (SELECT id FROM roles WHERE role_name = 'STUDENT')");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

    echo "\n--- Categories ---\n";
    $stmt = $db->query("SELECT id, name, type FROM categories");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
