<?php

namespace App\Models;

class GapAnalysis {
    public int $id;
    public int $student_id;
    public int $course_id;
    public string $weak_topics;
    public string $improvement_recommendations;
    public string $risk_level; // 'low','medium','high'
    public int $generated_by;
    public ?string $created_at;

    public function toArray(): array {
        return [
            'id' => $this->id ?? null,
            'student_id' => $this->student_id ?? null,
            'course_id' => $this->course_id ?? null,
            'weak_topics' => $this->weak_topics ?? null,
            'improvement_recommendations' => $this->improvement_recommendations ?? null,
            'risk_level' => $this->risk_level ?? null,
            'generated_by' => $this->generated_by ?? null,
            'created_at' => $this->created_at ?? null,
        ];
    }
}
