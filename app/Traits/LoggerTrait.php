<?php

namespace App\Traits;

trait LoggerTrait {
    protected function log($message, $level = 'INFO') {
        $logFile = __DIR__ . '/../../storage/logs/app.log';
        $timestamp = date('Y-m-d H:i:s');
        $formattedMessage = "[$timestamp] [$level] $message" . PHP_EOL;
        file_put_contents($logFile, $formattedMessage, FILE_APPEND);
    }

    protected function logError($message) {
        $this->log($message, 'ERROR');
    }
}
