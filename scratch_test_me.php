<?php
$token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NSwidXNlcl9pZCI6NSwidXNlcm5hbWUiOiJzdHVkZW50NSIsInJvbGUiOiJTVFVERU5UIiwiZXhwIjoxNzc4NDMwODYxfQ.uH5I0V6KizD5v37W3EjC65e53u9eUgtJbYYXg00uTGc';
echo file_get_contents('http://localhost/millinium/public/api/auth/me', false, stream_context_create(['http' => ['method' => 'GET', 'header' => 'Authorization: Bearer ' . $token]]));
