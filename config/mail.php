<?php

return [
    'mailer' => $_ENV['MAIL_MAILER'] ?? 'smtp',
    'host' => $_ENV['MAIL_HOST'] ?? 'localhost',
    'port' => (int) ($_ENV['MAIL_PORT'] ?? 25),
    'username' => $_ENV['MAIL_USERNAME'] ?? null,
    'password' => $_ENV['MAIL_PASSWORD'] ?? null,
    'encryption' => $_ENV['MAIL_ENCRYPTION'] ?? null,
    'from_address' => $_ENV['MAIL_FROM_ADDRESS'] ?? 'no-reply@millennium.edu',
    'from_name' => str_replace('${APP_NAME}', $_ENV['APP_NAME'] ?? 'The Millennium School E-Learning System', $_ENV['MAIL_FROM_NAME'] ?? 'The Millennium School E-Learning System'),
];
