<?php

namespace App\Helpers;

class HtmlSanitizer {
    public static function sanitize($data) {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = self::sanitize($value);
            }
        } else {
            $data = htmlspecialchars(strip_tags($data), ENT_QUOTES, 'UTF-8');
        }
        return $data;
    }
}
