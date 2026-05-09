<?php

/**
 * The Millennium School E-Learning System
 * Front Controller (Safe Mode)
 */

// Simple .env loader
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

require_once __DIR__ . '/../app/Engine/Request.php';
require_once __DIR__ . '/../app/Engine/Response.php';
require_once __DIR__ . '/../app/Internal/SystemRouter.php';
require_once __DIR__ . '/../app/Engine/Database.php';
require_once __DIR__ . '/../app/Helpers/functions.php';

// Manual autoloading
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

use App\Engine\Request;
use App\Engine\Response;

$request = new Request();
$response = new Response();
$router = new SystemRouter($request, $response);

// Load routes
require_once __DIR__ . '/../routes/api.php';

// Resolve request
$router->resolve();
