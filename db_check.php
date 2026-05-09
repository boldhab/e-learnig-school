<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=millennium_db', 'root', '');
    echo "DB_CONNECTED\n";
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch()) {
        echo $row[0] . "\n";
    }
} catch (Exception $e) {
    echo "DB_ERROR: " . $e->getMessage() . "\n";
}
