<?php
// require_once __DIR__ . '/../vendor/autoload.php';

// Manual autoloading simulation
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../app/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    if (file_exists($file)) require $file;
});

require_once __DIR__ . '/../app/Core/Database.php';

try {
    $db = \App\Core\Database::getInstance();
    $result = $db->query("SHOW TABLES LIKE 'gap_analysis'")->fetchAll();
    if (empty($result)) {
        echo "Table 'gap_analysis' does NOT exist.\n";
        $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        echo "Available tables: " . implode(', ', $tables) . "\n";
    } else {
        echo "Table 'gap_analysis' exists.\n";
        $columns = $db->query("DESCRIBE gap_analysis")->fetchAll();
        print_r($columns);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
