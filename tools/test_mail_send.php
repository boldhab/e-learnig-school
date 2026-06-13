<?php

require_once __DIR__ . '/../app/Core/Database.php';

if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0 || strpos($line, '=') === false) {
            continue;
        }

        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value, " \t\n\r\0\x0B\"'");
        $_ENV[$name] = $value;
        putenv("{$name}={$value}");
    }
}

spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/../app/';

    if (strncmp($prefix, $class, strlen($prefix)) !== 0) {
        return;
    }

    $relativeClass = substr($class, strlen($prefix));
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

$to = $argv[1] ?? ($_ENV['MAIL_FROM_ADDRESS'] ?? null);

if (!$to) {
    fwrite(STDERR, "No recipient provided and MAIL_FROM_ADDRESS is empty.\n");
    exit(1);
}

try {
    $mail = new App\Services\MailService();
    $mail->send(
        $to,
        'Millennium email notification test',
        "This is a test email from the daily notification feature.\n\nIf you received this, SMTP sending is working.",
        'Millennium Test'
    );

    echo "Test email sent to {$to}\n";
    exit(0);
} catch (Throwable $e) {
    fwrite(STDERR, "Test email failed: " . $e->getMessage() . "\n");
    exit(1);
}
