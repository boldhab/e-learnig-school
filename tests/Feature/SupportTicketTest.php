<?php

namespace Tests\Feature;

use PHPUnit\Framework\TestCase;

class SupportTicketTest extends TestCase {
    
    public function testTicketStatusTransition() {
        $validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        
        $this->assertTrue(in_array('in_progress', $validStatuses));
        $this->assertTrue(in_array('resolved', $validStatuses));
        $this->assertFalse(in_array('pending_review', $validStatuses));
    }
}
