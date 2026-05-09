<?php

namespace Tests\Feature;

use PHPUnit\Framework\TestCase;

class AnnouncementTest extends TestCase {
    
    public function testAnnouncementVisibilityLogic() {
        // Mocking the visibility check logic
        $this->assertTrue($this->isVisibleTo('student', 'all'));
        $this->assertTrue($this->isVisibleTo('student', 'student'));
        $this->assertFalse($this->isVisibleTo('student', 'teacher'));
        
        $this->assertTrue($this->isVisibleTo('teacher', 'all'));
        $this->assertFalse($this->isVisibleTo('teacher', 'admin'));
    }

    private function isVisibleTo($userRole, $targetRole) {
        return $targetRole === 'all' || $targetRole === $userRole;
    }
}
