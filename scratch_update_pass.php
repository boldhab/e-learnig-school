<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=millennium_db', 'root', '');
$hash = password_hash('password', PASSWORD_BCRYPT);
$pdo->exec("UPDATE users SET password = '$hash'");
echo "Passwords updated successfully.";
