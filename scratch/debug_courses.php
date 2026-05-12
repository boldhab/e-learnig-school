<?php
// Manual autoloading as used in public/index.php
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../app/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

require_once __DIR__ . '/../app/Core/Database.php';

$db = \App\Core\Database::getInstance();

echo "--- Current Student Users ---\n";
$students = $db->query("SELECT id, full_name, username, class_id FROM users WHERE role_id = (SELECT id FROM roles WHERE role_name = 'STUDENT' LIMIT 1)")->fetchAll();
foreach ($students as $s) {
    echo "ID: {$s['id']}, Name: {$s['full_name']}, ClassID: " . ($s['class_id'] ?? 'NULL') . "\n";
}

if (!empty($students)) {
    foreach ($students as $s) {
        $classId = $s['class_id'];
        if ($classId) {
            echo "\n--- Assignments for Class: {$s['full_name']} (ID: $classId) ---\n";
            $stmt = $db->prepare("SELECT ta.*, c.name as course_name FROM teacher_assignments ta JOIN categories c ON ta.course_id = c.id WHERE ta.class_id = ?");
            $stmt->execute([$classId]);
            $res = $stmt->fetchAll();
            if (empty($res)) {
                echo "No assignments found for this class in teacher_assignments table.\n";
            } else {
                print_r($res);
            }
        }
    }
}
