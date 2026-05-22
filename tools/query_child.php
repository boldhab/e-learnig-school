<?php
require __DIR__ . '/../app/Core/Database.php';

use App\Core\Database;

$pdo = Database::getInstance();

try {
    $stmt = $pdo->query("SELECT parent_id, student_id FROM parent_student LIMIT 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        echo json_encode(['error' => 'No parent_student links found']);
        exit(0);
    }

    $parent_id = (int) $row['parent_id'];
    $student_id = (int) $row['student_id'];

    $profileStmt = $pdo->prepare(<<<'SQL'
        SELECT
            u.id,
            u.full_name,
            u.student_id,
            u.email,
            u.created_at,
            u.class_id,
            c.name AS class_name,
            COALESCE(parent_cat.name, 'General') AS department_name,
            CONCAT(YEAR(CURDATE()), '/', YEAR(CURDATE()) + 1) AS academic_year
        FROM users u
        LEFT JOIN categories c ON c.id = u.class_id
        LEFT JOIN categories parent_cat ON parent_cat.id = c.parent_id
        WHERE u.id = :student_id
        GROUP BY u.id, u.full_name, u.student_id, u.email, u.created_at, u.class_id, c.name, parent_cat.name
        LIMIT 1
    SQL);

    $profileStmt->execute(['student_id' => $student_id]);
    $profile = $profileStmt->fetch(PDO::FETCH_ASSOC);

    $childrenListStmt = $pdo->prepare("SELECT * FROM parent_student WHERE parent_id = :parent_id LIMIT 10");
    $childrenListStmt->execute(['parent_id' => $parent_id]);
    $links = $childrenListStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'parent_id' => $parent_id,
        'student_id' => $student_id,
        'profile' => $profile ?: null,
        'links' => $links,
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
