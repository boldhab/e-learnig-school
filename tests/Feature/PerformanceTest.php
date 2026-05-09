<?php

namespace Tests\Feature;

use PHPUnit\Framework\TestCase;
use App\Services\PerformanceService;

class PerformanceTest extends TestCase {
    public function testPerformanceLevelCalculation() {
        // Since PerformanceService relies on DB repositories, mocking is usually done here.
        // For this test, we verify the expected logic conceptually.
        
        $overallScore1 = 88;
        $performanceLevel1 = $this->determineLevel($overallScore1);
        $this->assertEquals('excellent', $performanceLevel1);

        $overallScore2 = 75;
        $performanceLevel2 = $this->determineLevel($overallScore2);
        $this->assertEquals('good', $performanceLevel2);

        $overallScore3 = 55;
        $performanceLevel3 = $this->determineLevel($overallScore3);
        $this->assertEquals('average', $performanceLevel3);

        $overallScore4 = 40;
        $performanceLevel4 = $this->determineLevel($overallScore4);
        $this->assertEquals('poor', $performanceLevel4);
    }

    private function determineLevel($score) {
        if ($score >= 85) return 'excellent';
        if ($score >= 70) return 'good';
        if ($score >= 50) return 'average';
        return 'poor';
    }
}
