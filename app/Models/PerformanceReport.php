<?php

namespace App\Models;

class PerformanceReport {
    public int $id;
    public int $student_id;
    public int $course_id;
    public float $assignment_average;
    public float $quiz_average;
    public float $exam_average;
    public float $attendance_percentage;
    public float $overall_score;
    public string $performance_level; // 'excellent','good','average','poor'
    public ?string $generated_at;

    public function toArray(): array {
        return [
            'id' => $this->id ?? null,
            'student_id' => $this->student_id ?? null,
            'course_id' => $this->course_id ?? null,
            'assignment_average' => $this->assignment_average ?? 0.0,
            'quiz_average' => $this->quiz_average ?? 0.0,
            'exam_average' => $this->exam_average ?? 0.0,
            'attendance_percentage' => $this->attendance_percentage ?? 0.0,
            'overall_score' => $this->overall_score ?? 0.0,
            'performance_level' => $this->performance_level ?? null,
            'generated_at' => $this->generated_at ?? null,
        ];
    }
}
