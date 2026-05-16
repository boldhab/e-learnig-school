<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=millennium_db', 'root', '');
    $stmt = $pdo->query("SHOW TABLES LIKE 'gap_analysis'");
    $table = $stmt->fetch();
    if ($table) {
        echo "TABLE_EXISTS: " . $table[0] . "\n";
        $stmt = $pdo->query("DESCRIBE gap_analysis");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "COLUMN: " . $row['Field'] . " (" . $row['Type'] . ")\n";
        }
    } else {
        echo "TABLE_MISSING\n";
    }
} catch (Exception $e) {
    echo "DB_ERROR: " . $e->getMessage() . "\n";
}
