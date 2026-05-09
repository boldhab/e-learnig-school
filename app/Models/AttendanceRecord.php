<?php

namespace App\Models;

class AttendanceRecord {
    public int $id;
    public int $student_id;
    public int $course_id;
    public int $teacher_id;
    public string $attendance_date;
    public string $status; // 'present','absent','late','excused'
    public ?string $remarks;
    public ?string $created_at;
    public ?string $updated_at;

    public function toArray(): array {
        return [
            'id' => $this->id ?? null,
            'student_id' => $this->student_id ?? null,
            'course_id' => $this->course_id ?? null,
            'teacher_id' => $this->teacher_id ?? null,
            'attendance_date' => $this->attendance_date ?? null,
            'status' => $this->status ?? null,
            'remarks' => $this->remarks ?? null,
            'created_at' => $this->created_at ?? null,
            'updated_at' => $this->updated_at ?? null,
        ];
    }
}
