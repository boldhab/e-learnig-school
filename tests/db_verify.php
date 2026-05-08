<?php

/**
 * Database Verification Script
 * Checks for required tables and schema structure.
 */

require_once __DIR__ . '/../app/Core/Database.php';

use App\Core\Database;

try {
    $db = Database::getInstance();
    echo "--- Database Connection: SUCCESS ---\n\n";

    $requiredTables = ['users', 'roles', 'login_logs', 'materials', 'categories', 'assignments', 'submissions', 'grades', 'discussion_groups', 'discussion_topics', 'discussion_messages', 'teacher_assignments'];
    
    $stmt = $db->query("SHOW TABLES");
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($requiredTables as $table) {
        if (in_array($table, $existingTables)) {
            echo "[PASS] Table '$table' exists.\n";
            verifySchema($db, $table);
        } else {
            echo "[FAIL] Table '$table' is MISSING.\n";
        }
        echo "\n";
    }

} catch (Exception $e) {
    echo "[ERROR] " . $e->getMessage() . "\n";
}

function verifySchema($db, $table) {
    $stmt = $db->query("DESCRIBE $table");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "      Columns in '$table':\n";
    foreach ($columns as $col) {
        echo "      - {$col['Field']} ({$col['Type']})\n";
    }
}
