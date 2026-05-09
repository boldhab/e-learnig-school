<?php

use App\Core\Events\EventDispatcher;

if (!function_exists('event')) {
    /**
     * Dispatch an event.
     *
     * @param object $event
     * @param string|null $socketId
     * @return void
     */
    function event($event, ?string $socketId = null) {
        $dispatcher = new EventDispatcher();
        $dispatcher->dispatch($event, $socketId);
    }
}
