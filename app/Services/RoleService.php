<?php

namespace App\Services;

class RoleService {
    public function checkPermission($userRole, $requiredRole) {
        $roles = require __DIR__ . '/../../config/roles.php';
        
        if ($userRole === 'ADMIN') return true;
        if ($userRole === $requiredRole) return true;
        
        return false;
    }
}
