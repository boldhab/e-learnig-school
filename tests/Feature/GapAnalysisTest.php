<?php

namespace Tests\Feature;

use PHPUnit\Framework\TestCase;

class GapAnalysisTest extends TestCase {
    public function testRiskLevelLogic() {
        // High risk: attendance < 60 OR score < 50
        $this->assertEquals('high', $this->determineRisk(50, 80)); // Low attendance
        $this->assertEquals('high', $this->determineRisk(80, 40)); // Low score
        
        // Medium risk: attendance 60-75 OR score 50-65
        $this->assertEquals('medium', $this->determineRisk(65, 80)); // Med attendance
        $this->assertEquals('medium', $this->determineRisk(80, 60)); // Med score

        // Low risk: attendance > 75 AND score > 65
        $this->assertEquals('low', $this->determineRisk(80, 80)); // Good both
    }

    private function determineRisk($attendancePercentage, $overallScore) {
        if ($attendancePercentage < 60 || $overallScore < 50) {
            return 'high';
        } elseif (($attendancePercentage >= 60 && $attendancePercentage <= 75) || ($overallScore >= 50 && $overallScore <= 65)) {
            return 'medium';
        } else {
            return 'low';
        }
    }
}
