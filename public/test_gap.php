<?php
// Manual autoloading
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../app/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    if (file_exists($file)) require $file;
});

// Explicitly require core files
require_once __DIR__ . '/../app/Core/Database.php';

header('Content-Type: text/plain');

try {
    // We need to load .env variables if they are used by Database config
    if (file_exists(__DIR__ . '/../.env')) {
        $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            if (strpos($line, '=') === false) continue;
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            $_ENV[$name] = $value;
            putenv("$name=$value");
        }
    }

    $db = \App\Core\Database::getInstance();
    echo "DB_CONNECTION_OK\n";
    
    $stmt = $db->query("SHOW TABLES LIKE 'gap_analysis'");
    $table = $stmt->fetch();
    if ($table) {
        echo "TABLE_gap_analysis_EXISTS\n";
        $stmt = $db->query("DESCRIBE gap_analysis");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "COLUMN: " . $row['Field'] . " (" . $row['Type'] . ")\n";
        }
    } else {
        echo "TABLE_gap_analysis_MISSING\n";
        // Show all tables
        echo "ALL_TABLES:\n";
        $stmt = $db->query("SHOW TABLES");
        while ($row = $stmt->fetch()) {
            echo "- " . $row[0] . "\n";
        }
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "TRACE:\n" . $e->getTraceAsString() . "\n";
}
